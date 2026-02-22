import { useCallback, useEffect, useMemo, useState } from 'react';

import { appointmentsService } from '@/lib/appointments-service';

import type {
  Appointment,
  AppointmentStatus,
  MonthlyDataItem,
  StatusDataItem,
  WeeklyDataItem,
} from '@/types/appointment';

const STATUS_PIE_COLORS: Record<AppointmentStatus, string> = {
  scheduled: '#3b82f6',
  confirmed: '#10b981',
  completed: '#6366f1',
  cancelled: '#ef4444',
  'no-show': '#f59e0b',
};

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDaysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function useAppointmentsOverview(userId: string | null | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const doctorId = userId ?? null;
      if (!doctorId) {
        setAppointments([]);
        setLoading(false);
        return;
      }
      const all = await appointmentsService.getAppointmentsByDoctor(doctorId);
      const fourWeeksAgo = formatDate(getDaysAgo(28));
      const list = all
        .filter((a) => a.date >= fourWeeksAgo)
        .sort((a, b) =>
          a.date !== b.date ? a.date.localeCompare(b.date) : a.startTime.localeCompare(b.startTime)
        );
      setAppointments(list);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : e != null ? String(e) : 'Failed to load appointments';
      setError(message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAppointments();
    } else {
      setAppointments([]);
      setLoading(false);
    }
  }, [userId, fetchAppointments]);

  const today = formatDate(new Date());
  const todayAppointments = appointments.filter((a) => a.date === today);

  // statusData for PieChart: [ { name, value, color } ] for each status
  const statusCounts = appointments.reduce<Record<AppointmentStatus, number>>(
    (acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    },
    {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      'no-show': 0,
    }
  );
  const statusData: StatusDataItem[] = (
    (['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'] as const)
  ).map((status) => ({
    name: status === 'no-show' ? 'No-show' : status.charAt(0).toUpperCase() + status.slice(1),
    value: statusCounts[status],
    color: STATUS_PIE_COLORS[status],
  }));

  // Weekly trend: last 7 days (for bar chart)
  const weeklyData = useMemo(() => {
    const days: WeeklyDataItem[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      const dayAppointments = appointments.filter((apt) => apt.date === dateStr);

      days.push({
        date: dayName,
        fullDate: dateStr,
        appointments: dayAppointments.length,
        confirmed: dayAppointments.filter((a) => a.status === 'confirmed').length,
        completed: dayAppointments.filter((a) => a.status === 'completed').length,
      });
    }

    return days;
  }, [appointments]);

  // Monthly trend: last 4 weeks (for line chart)
  const monthlyData = useMemo(() => {
    const weeks: MonthlyDataItem[] = [];
    const today = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekAppointments = appointments.filter((apt) => {
        const aptDate = new Date(apt.date + 'T00:00:00');
        return aptDate >= weekStart && aptDate <= weekEnd;
      });

      weeks.push({
        week: `Week ${4 - i}`,
        appointments: weekAppointments.length,
      });
    }

    return weeks;
  }, [appointments]);

  return {
    appointments,
    todayAppointments,
    statusData,
    weeklyData,
    monthlyData,
    loading,
    error,
    refetch: fetchAppointments,
  };
}

/** Fetch all appointments for the given doctor (no date filter). For Appointments screen. */
export function useAllAppointments(userId: string | null | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const doctorId = userId ?? null;
      if (!doctorId) {
        setAppointments([]);
        setLoading(false);
        return;
      }
      const all = await appointmentsService.getAppointmentsByDoctor(doctorId);
      const sorted = [...all].sort((a, b) =>
        a.date !== b.date
          ? b.date.localeCompare(a.date)
          : b.startTime.localeCompare(a.startTime)
      );
      setAppointments(sorted);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : e != null ? String(e) : 'Failed to load appointments';
      setError(message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAppointments();
    } else {
      setAppointments([]);
      setLoading(false);
    }
  }, [userId, fetchAppointments]);

  return { appointments, loading, error, refetch: fetchAppointments };
}

/** One appointment summary for display under a patient. */
export interface PatientAppointmentSummary {
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
}

/** Patient derived from appointments (unique by phone; name/email from latest). */
export interface Patient {
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  appointmentCount: number;
  appointments: PatientAppointmentSummary[];
}

/** Fetch unique patients for the given doctor from their appointments. */
export function usePatients(userId: string | null | undefined) {
  const { appointments, loading, error, refetch } = useAllAppointments(userId);

  const patients = useMemo((): Patient[] => {
    const byKey = new Map<string, Patient>();
    for (const apt of appointments) {
      const key = apt.patientPhone?.trim() || apt.patientName?.trim() || apt.id || apt.slotId || '';
      if (!key) continue;
      const summary: PatientAppointmentSummary = {
        date: apt.date,
        startTime: apt.startTime,
        endTime: apt.endTime,
        status: apt.status,
      };
      const existing = byKey.get(key);
      if (existing) {
        existing.appointmentCount += 1;
        existing.appointments.push(summary);
        if (apt.patientEmail?.trim()) existing.patientEmail = apt.patientEmail.trim();
      } else {
        byKey.set(key, {
          patientName: apt.patientName?.trim() ?? '',
          patientPhone: apt.patientPhone?.trim() ?? '',
          patientEmail: apt.patientEmail?.trim() || undefined,
          appointmentCount: 1,
          appointments: [summary],
        });
      }
    }
    const list = [...byKey.values()];
    for (const p of list) {
      p.appointments.sort((a, b) =>
        a.date !== b.date
          ? b.date.localeCompare(a.date)
          : b.startTime.localeCompare(a.startTime)
      );
    }
    return list.sort((a, b) =>
      a.patientName.localeCompare(b.patientName, undefined, { sensitivity: 'base' })
    );
  }, [appointments]);

  return { patients, loading, error, refetch };
}
