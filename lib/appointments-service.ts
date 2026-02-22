import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Appointment, AppointmentStatus } from '@/types/appointment';

const APPOINTMENTS_COLLECTION = 'appointments';

function normalizeStatus(s: unknown): AppointmentStatus {
  const v = String(s ?? '').toLowerCase();
  if (v === 'scheduled' || v === 'confirmed' || v === 'completed' || v === 'cancelled' || v === 'no-show') {
    return v;
  }
  return 'scheduled';
}

function fromDoc(docSnap: { id: string; data: () => Record<string, unknown> }): Appointment {
  const data = docSnap.data();
  const createdAt = data.createdAt as Timestamp | undefined;
  const updatedAt = data.updatedAt as Timestamp | undefined;
  return {
    id: docSnap.id,
    slotId: (data.slotId as string) ?? docSnap.id,
    patientName: (data.patientName as string) ?? (data.name as string) ?? '',
    patientPhone: (data.patientPhone as string) ?? '',
    patientEmail: data.patientEmail as string | undefined,
    date: (data.date as string) ?? '',
    startTime: (data.startTime as string) ?? '',
    endTime: (data.endTime as string) ?? '',
    doctorId: (data.doctorId as string) ?? '',
    doctorName: (data.doctorName as string) ?? '',
    status: normalizeStatus(data.status),
    notes: data.notes as string | undefined,
    createdAt: createdAt?.toDate?.()?.toISOString?.() ?? undefined,
    updatedAt: updatedAt?.toDate?.()?.toISOString?.() ?? undefined,
  };
}

export const appointmentsService = {
  createAppointment: async (
    appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), {
      ...appointment,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  getAllAppointments: async (): Promise<Appointment[]> => {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      orderBy('date', 'asc'),
      orderBy('startTime', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => fromDoc({ id: d.id, data: () => d.data() }));
  },

  getAppointmentsByDoctor: async (doctorId: string): Promise<Appointment[]> => {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('doctorId', '==', doctorId),
      orderBy('date', 'asc'),
      orderBy('startTime', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => fromDoc({ id: d.id, data: () => d.data() }));
  },

  getAppointmentsByDate: async (date: string): Promise<Appointment[]> => {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('date', '==', date),
      orderBy('startTime', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => fromDoc({ id: d.id, data: () => d.data() }));
  },

  getAppointmentsByStatus: async (status: Appointment['status']): Promise<Appointment[]> => {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('status', '==', status),
      orderBy('date', 'asc'),
      orderBy('startTime', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => fromDoc({ id: d.id, data: () => d.data() }));
  },

  updateAppointment: async (
    appointmentId: string,
    updates: Partial<Appointment>
  ): Promise<void> => {
    const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(appointmentRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  deleteAppointment: async (appointmentId: string): Promise<void> => {
    await deleteDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId));
  },
};
