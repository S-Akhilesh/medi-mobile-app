import { collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Slot } from '@/types/appointment';

const SLOTS_COLLECTION = 'slots';

function fromDoc(docSnap: { id: string; data: () => Record<string, unknown> }): Slot {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    doctorId: (data.doctorId as string) ?? '',
    date: (data.date as string) ?? '',
    startTime: (data.startTime as string) ?? '',
    endTime: (data.endTime as string) ?? '',
  };
}

/**
 * Fetches all slots from Firestore for a doctor (once per page load).
 * No composite index needed: query is only by doctorId; sorting done in memory.
 */
export const slotsService = {
  getSlotsByDoctor: async (doctorId: string): Promise<Slot[]> => {
    if (!doctorId) return [];
    const q = query(
      collection(db, SLOTS_COLLECTION),
      where('doctorId', '==', doctorId)
    );
    const snapshot = await getDocs(q);
    const slots = snapshot.docs.map((d) => fromDoc({ id: d.id, data: () => d.data() }));
    slots.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
    return slots;
  },
};
