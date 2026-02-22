import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

import { db } from '@/lib/firebase';

import type { Appointment, AppointmentStatusCounts, DayCount, WeekCount } from '@/types/appointment';

const APPOINTMENTS_COLLECTION = 'appointments';

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDaysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function useAppointmentsOverview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
        setAppointments([]);
        setLoading(false);
        return;
      }
      const fourWeeksAgo = formatDate(getDaysAgo(28));
      const q = query(
        collection(db, APPOINTMENTS_COLLECTION),
        where('date', '>=', fourWeeksAgo),
        orderBy('date', 'asc')
      );
      const snapshot = await getDocs(q);
      const list: Appointment[] = snapshot.docs
        .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date ?? '',
          startTime: data.startTime ?? '',
          endTime: data.endTime ?? '',
          name: data.name ?? '',
          status: (data.status === 'scheduled' ? 'scheduled' : 'confirmed') as Appointment['status'],
        };
      })
        .sort((a, b) => (a.date !== b.date ? a.date.localeCompare(b.date) : a.startTime.localeCompare(b.startTime)));
      setAppointments(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const today = formatDate(new Date());

  const todayAppointments = appointments.filter((a) => a.date === today);

  const statusDistribution: AppointmentStatusCounts = appointments.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    },
    { confirmed: 0, scheduled: 0 } as AppointmentStatusCounts
  );

  const last7Days: DayCount[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = getDaysAgo(i);
    const dateStr = formatDate(d);
    const dayAppointments = appointments.filter((a) => a.date === dateStr);
    last7Days.push({
      day: getDayLabel(dateStr),
      confirmed: dayAppointments.filter((a) => a.status === 'confirmed').length,
      scheduled: dayAppointments.filter((a) => a.status === 'scheduled').length,
    });
  }

  const last4Weeks: WeekCount[] = [];
  const now = new Date();
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7 * w);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekAppointments = appointments.filter((a) => {
      const d = a.date;
      return d >= formatDate(weekStart) && d <= formatDate(weekEnd);
    });
    last4Weeks.push({
      weekLabel: `Week ${4 - w}`,
      total: weekAppointments.length,
    });
  }

  return {
    appointments,
    todayAppointments,
    statusDistribution,
    last7Days,
    last4Weeks,
    loading,
    error,
    refetch: fetchAppointments,
  };
}
