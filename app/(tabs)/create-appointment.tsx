import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AuthenticatedHeader } from '@/components/authenticated-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { appointmentsService } from '@/lib/appointments-service';
import { slotsService } from '@/lib/slots-service';

import type { Slot } from '@/types/appointment';

function formatDateForInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function timeToMinutes(hour: number, minute: number): number {
  return hour * 60 + minute;
}

function slotOverlapsAppointment(
  slot: { startTime: string; endTime: string },
  apt: { startTime: string; endTime: string }
): boolean {
  const [sH, sM] = slot.startTime.split(':').map(Number);
  const [eH, eM] = slot.endTime.split(':').map(Number);
  const [aSH, aSM] = apt.startTime.split(':').map(Number);
  const [aEH, aEM] = apt.endTime.split(':').map(Number);
  const slotStart = timeToMinutes(sH, sM);
  const slotEnd = timeToMinutes(eH, eM);
  const aptStart = timeToMinutes(aSH, aSM);
  const aptEnd = timeToMinutes(aEH, aEM);
  return slotStart < aptEnd && aptStart < slotEnd;
}

function isSlotInPast(dateStr: string, startTime: string): boolean {
  const today = formatDateForInput(new Date());
  if (dateStr !== today) return false;
  const [h, m] = startTime.split(':').map(Number);
  const slotMins = timeToMinutes(h, m);
  const now = new Date();
  const nowMins = timeToMinutes(now.getHours(), now.getMinutes());
  return slotMins <= nowMins;
}

const DEFAULT_SLOT_DURATION = 30;
const DEFAULT_WORK_START = { hour: 9, minute: 0 };
const DEFAULT_WORK_END = { hour: 17, minute: 0 };

function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Fallback slots when Firebase has none: 9:00–17:00, 30 min, for the given date. */
function getDefaultSlotsForDate(date: string, doctorId: string): Slot[] {
  const slots: Slot[] = [];
  const startMins = timeToMinutes(DEFAULT_WORK_START.hour, DEFAULT_WORK_START.minute);
  const endMins = timeToMinutes(DEFAULT_WORK_END.hour, DEFAULT_WORK_END.minute);
  for (let m = startMins; m + DEFAULT_SLOT_DURATION <= endMins; m += DEFAULT_SLOT_DURATION) {
    const sh = Math.floor(m / 60);
    const sm = m % 60;
    const em = m + DEFAULT_SLOT_DURATION;
    const eh = Math.floor(em / 60);
    const eMin = em % 60;
    slots.push({
      id: `default-${date}-${formatTime(sh, sm)}`,
      doctorId,
      date,
      startTime: formatTime(sh, sm),
      endTime: formatTime(eh, eMin),
    });
  }
  return slots;
}

export default function CreateAppointmentScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [date, setDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [existingOnDate, setExistingOnDate] = useState<{ startTime: string; endTime: string }[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const doctorId = user?.uid ?? '';
  const doctorName = user?.displayName ?? user?.email ?? 'Doctor';

  // Slots for selected date: from Firebase, or fallback to default (9:00–17:00, 30 min)
  const slotsForDate = useMemo(() => {
    if (!date || date.length !== 10) return [];
    const fromFirebase = allSlots.filter((slot) => slot.date === date);
    if (fromFirebase.length > 0) return fromFirebase;
    return getDefaultSlotsForDate(date, doctorId);
  }, [date, allSlots, doctorId]);

  // Available = slots for this date that aren't taken and aren't in the past
  const availableSlots = useMemo(() => {
    if (!date || date.length !== 10) return [];
    return slotsForDate.filter((slot) => {
      const taken = existingOnDate.some((apt) => slotOverlapsAppointment(slot, apt));
      if (taken) return false;
      if (isSlotInPast(date, slot.startTime)) return false;
      return true;
    });
  }, [date, slotsForDate, existingOnDate]);

  // Fetch all slots once when page opens
  useEffect(() => {
    if (!doctorId) {
      setAllSlots([]);
      setSlotsLoading(false);
      return;
    }
    setSlotsLoading(true);
    slotsService
      .getSlotsByDoctor(doctorId)
      .then(setAllSlots)
      .catch(() => setAllSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [doctorId]);

  // When date is selected, fetch appointments for that date only (to know which slots are taken)
  useEffect(() => {
    if (!date || date.length !== 10 || !doctorId) {
      setExistingOnDate([]);
      setAppointmentsLoading(false);
      return;
    }
    setAppointmentsLoading(true);
    appointmentsService
      .getAppointmentsByDoctor(doctorId)
      .then((all) => {
        const onDate = all
          .filter((a) => a.date === date)
          .filter((a) => a.status !== 'cancelled')
          .map((a) => ({ startTime: a.startTime, endTime: a.endTime }));
        setExistingOnDate(onDate);
      })
      .catch(() => setExistingOnDate([]))
      .finally(() => setAppointmentsLoading(false));
  }, [date, doctorId]);

  const onDatePickerChange = useCallback(
    (event: { type: string }, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
        if (event.type === 'dismissed') return;
      }
      if (selectedDate) {
        const next = new Date(selectedDate);
        next.setHours(0, 0, 0, 0);
        setDatePickerValue(next);
        setDate(formatDateForInput(next));
        setStartTime('');
        setEndTime('');
        setSelectedSlotId(null);
      }
    },
    []
  );

  const selectSlot = useCallback((slot: Slot) => {
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setSelectedSlotId(slot.id);
  }, []);

  async function handleSubmit() {
    const name = patientName.trim();
    const phone = patientPhone.trim();
    if (!name) {
      Alert.alert('Required', 'Please enter patient name.');
      return;
    }
    if (!phone) {
      Alert.alert('Required', 'Please enter patient phone.');
      return;
    }
    if (!date.trim()) {
      Alert.alert('Required', 'Please select a date.');
      return;
    }
    if (!startTime.trim() || !endTime.trim()) {
      Alert.alert('Required', 'Please select an available time slot.');
      return;
    }

    setSubmitting(true);
    try {
      await appointmentsService.createAppointment({
        slotId: selectedSlotId ?? `slot-${Date.now()}`,
        patientName: name,
        patientPhone: phone,
        patientEmail: patientEmail.trim() || undefined,
        date: date.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        doctorId,
        doctorName,
        status: 'scheduled',
        notes: notes.trim() || undefined,
      });
      Alert.alert('Success', 'Appointment created.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert(
        'Error',
        e instanceof Error ? e.message : 'Failed to create appointment'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = [
    styles.input,
    { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.cardBackground },
  ];

  const displayDateLabel = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Tap to select date';

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthenticatedHeader subtitle="New appointment" />

          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            Patient name *
          </ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="Full name"
            placeholderTextColor={colors.textSecondary}
            value={patientName}
            onChangeText={setPatientName}
            editable={!submitting}
          />

          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            Patient phone *
          </ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="Phone number"
            placeholderTextColor={colors.textSecondary}
            value={patientPhone}
            onChangeText={setPatientPhone}
            keyboardType="phone-pad"
            editable={!submitting}
          />

          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            Patient email (optional)
          </ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={patientEmail}
            onChangeText={setPatientEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!submitting}
          />

          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            Date *
          </ThemedText>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            disabled={submitting}
            style={[inputStyle, styles.dateTouchable]}
          >
            <ThemedText style={{ color: date ? colors.text : colors.textSecondary }}>
              {displayDateLabel}
            </ThemedText>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={datePickerValue}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={onDatePickerChange}
            />
          )}
          {Platform.OS === 'ios' && showDatePicker && (
            <View style={styles.iosDatePickerActions}>
              <Pressable
                onPress={() => {
                  setDate(formatDateForInput(datePickerValue));
                  setStartTime('');
                  setEndTime('');
                  setSelectedSlotId(null);
                  setShowDatePicker(false);
                }}
                style={styles.iosDatePickerBtn}
              >
                <ThemedText style={[styles.iosDatePickerBtnText, { color: colors.tint }]}>
                  Done
                </ThemedText>
              </Pressable>
            </View>
          )}

          {date ? (
            <>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Available time slots *
              </ThemedText>
              {slotsLoading ? (
                <ThemedText style={[styles.slotMessage, { color: colors.textSecondary }]}>
                  Loading slots…
                </ThemedText>
              ) : appointmentsLoading ? (
                <ThemedText style={[styles.slotMessage, { color: colors.textSecondary }]}>
                  Checking availability…
                </ThemedText>
              ) : availableSlots.length === 0 ? (
                <View style={[styles.noSlotsBox, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                  <ThemedText style={[styles.noSlotsText, { color: colors.textSecondary }]}>
                    {slotsForDate.length === 0
                      ? 'No slots defined for this date. Add slots in Firebase or choose another day.'
                      : 'All slots are booked for this date. Please choose another day.'}
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.slotGrid}>
                  {availableSlots.map((slot) => {
                    const selected = startTime === slot.startTime && endTime === slot.endTime;
                    const label = `${slot.startTime} – ${slot.endTime}`;
                    return (
                      <Pressable
                        key={slot.id}
                        onPress={() => selectSlot(slot)}
                        disabled={submitting}
                        style={[
                          styles.slotChip,
                          {
                            borderColor: colors.cardBorder,
                            backgroundColor: selected ? colors.tint : colors.cardBackground,
                          },
                        ]}
                      >
                        <ThemedText
                          style={[styles.slotChipText, { color: selected ? '#fff' : colors.text }]}
                        >
                          {label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </>
          ) : null}

          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            Notes (optional)
          </ThemedText>
          <TextInput
            style={[inputStyle, styles.notesInput]}
            placeholder="Notes"
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            editable={!submitting}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: colors.tint },
              pressed && styles.submitBtnPressed,
            ]}
          >
            {submitting ? (
              <ThemedText style={styles.submitBtnText}>Creating…</ThemedText>
            ) : (
              <ThemedText style={styles.submitBtnText}>Create appointment</ThemedText>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            disabled={submitting}
            style={[styles.cancelBtn, { marginTop: 12 }]}
          >
            <ThemedText style={[styles.cancelBtnText, { color: colors.textSecondary }]}>
              Cancel
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  dateTouchable: {
    justifyContent: 'center',
  },
  iosDatePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  iosDatePickerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  iosDatePickerBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  slotMessage: {
    fontSize: 15,
    marginTop: 4,
  },
  noSlotsBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  noSlotsText: {
    fontSize: 15,
    textAlign: 'center',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  slotChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  slotChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnPressed: {
    opacity: 0.8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
  },
});
