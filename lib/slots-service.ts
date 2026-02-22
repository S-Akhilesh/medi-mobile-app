import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Slot } from '@/types/appointment';

const SLOTS_COLLECTION = 'slots';

const sortSlots = (slots: Slot[]): Slot[] => {
  return [...slots].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.startTime !== b.startTime) return a.startTime.localeCompare(b.startTime);
    return a.endTime.localeCompare(b.endTime);
  });
};

/** Strip id and undefined values; for use in updateDoc. */
function sanitizeSlotUpdates(updates: Partial<Slot>): Record<string, unknown> {
  const { id, ...rest } = updates;
  return Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined)
  ) as Record<string, unknown>;
}

/** Map Firestore doc to Slot. Uses isAvailable (or available) for availability. */
function fromDoc(docSnap: { id: string; data: () => Record<string, unknown> }): Slot {
  const data = docSnap.data();
  const isAvailable = data.isAvailable;
  const availableLegacy = data.available;
  const available =
    isAvailable !== undefined ? Boolean(isAvailable) : availableLegacy === undefined ? true : Boolean(availableLegacy);
  return {
    id: docSnap.id,
    doctorId: (data.doctorId as string) ?? '',
    date: (data.date as string) ?? '',
    startTime: (data.startTime as string) ?? '',
    endTime: (data.endTime as string) ?? '',
    available,
  };
}

/** Map Slot to Firestore shape (use isAvailable for the field name). */
function toFirestore(slot: Partial<Slot>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (slot.doctorId !== undefined) out.doctorId = slot.doctorId;
  if (slot.date !== undefined) out.date = slot.date;
  if (slot.startTime !== undefined) out.startTime = slot.startTime;
  if (slot.endTime !== undefined) out.endTime = slot.endTime;
  if (slot.available !== undefined) out.isAvailable = slot.available;
  return out;
}

export const slotsService = {
  createSlot: async (
    slot: Omit<Slot, 'id'>
  ): Promise<string> => {
    const docRef = await addDoc(collection(db, SLOTS_COLLECTION), {
      ...toFirestore(slot),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  getSlotsByDoctor: async (doctorId: string): Promise<Slot[]> => {
    if (!doctorId) return [];
    const q = query(
      collection(db, SLOTS_COLLECTION),
      where('doctorId', '==', doctorId)
    );
    const snapshot = await getDocs(q);
    const slots = snapshot.docs.map((d) => fromDoc({ id: d.id, data: () => d.data() }));
    return sortSlots(slots);
  },

  getSlotsByDate: async (date: string): Promise<Slot[]> => {
    if (!date) return [];
    const q = query(
      collection(db, SLOTS_COLLECTION),
      where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    const slots = snapshot.docs.map((d) => fromDoc({ id: d.id, data: () => d.data() }));
    return sortSlots(slots);
  },

  getAvailableSlots: async (date?: string): Promise<Slot[]> => {
    let q;
    if (date) {
      q = query(
        collection(db, SLOTS_COLLECTION),
        where('date', '==', date),
        where('isAvailable', '==', true)
      );
    } else {
      q = query(
        collection(db, SLOTS_COLLECTION),
        where('isAvailable', '==', true)
      );
    }
    const snapshot = await getDocs(q);
    const slots = snapshot.docs.map((d) => fromDoc({ id: d.id, data: () => d.data() }));
    return sortSlots(slots);
  },

  updateSlot: async (slotId: string, updates: Partial<Slot>): Promise<void> => {
    const payload = sanitizeSlotUpdates(updates);
    if (payload.available !== undefined) {
      payload.isAvailable = payload.available;
      delete payload.available;
    }
    const ref = doc(db, SLOTS_COLLECTION, slotId);
    await updateDoc(ref, {
      ...payload,
      updatedAt: Timestamp.now(),
    });
  },

  deleteSlot: async (slotId: string): Promise<void> => {
    await deleteDoc(doc(db, SLOTS_COLLECTION, slotId));
  },

  updateSlotAvailability: async (slotId: string, available: boolean): Promise<void> => {
    await updateDoc(doc(db, SLOTS_COLLECTION, slotId), {
      isAvailable: available,
      updatedAt: Timestamp.now(),
    });
  },
};
