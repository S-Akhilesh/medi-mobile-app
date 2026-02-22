import { router } from 'expo-router';
import React, { useState } from 'react';
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

import type { AppointmentStatus } from '@/types/appointment';

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T12:00:00'));
}

function isValidTime(s: string): boolean {
  return /^([01]?\d|2[0-3]):[0-5]\d$/.test(s);
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
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('scheduled');
  const [notes, setNotes] = useState('');

  const doctorId = user?.uid ?? '';
  const doctorName = user?.displayName ?? user?.email ?? 'Doctor';

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
      Alert.alert('Required', 'Please enter appointment date (YYYY-MM-DD).');
      return;
    }
    if (!isValidDate(date.trim())) {
      Alert.alert('Invalid date', 'Use format YYYY-MM-DD (e.g. 2025-03-15).');
      return;
    }
    if (!startTime.trim()) {
      Alert.alert('Required', 'Please enter start time (HH:MM).');
      return;
    }
    if (!isValidTime(startTime.trim())) {
      Alert.alert('Invalid time', 'Use 24-hour format HH:MM (e.g. 09:00).');
      return;
    }
    if (!endTime.trim()) {
      Alert.alert('Required', 'Please enter end time (HH:MM).');
      return;
    }
    if (!isValidTime(endTime.trim())) {
      Alert.alert('Invalid time', 'Use 24-hour format HH:MM (e.g. 09:30).');
      return;
    }

    setSubmitting(true);
    try {
      await appointmentsService.createAppointment({
        slotId: `slot-${Date.now()}`,
        patientName: name,
        patientPhone: phone,
        patientEmail: patientEmail.trim() || undefined,
        date: date.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        doctorId,
        doctorName,
        status,
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
          <TextInput
            style={inputStyle}
            placeholder="YYYY-MM-DD (e.g. 2025-03-15)"
            placeholderTextColor={colors.textSecondary}
            value={date}
            onChangeText={setDate}
            editable={!submitting}
          />

          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            Start time *
          </ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="HH:MM 24h (e.g. 09:00)"
            placeholderTextColor={colors.textSecondary}
            value={startTime}
            onChangeText={setStartTime}
            editable={!submitting}
          />

          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            End time *
          </ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="HH:MM 24h (e.g. 09:30)"
            placeholderTextColor={colors.textSecondary}
            value={endTime}
            onChangeText={setEndTime}
            editable={!submitting}
          />

          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            Status
          </ThemedText>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setStatus(opt.value)}
                disabled={submitting}
                style={[
                  styles.statusChip,
                  {
                    borderColor: colors.cardBorder,
                    backgroundColor: status === opt.value ? colors.tint : colors.cardBackground,
                  },
                ]}
              >
                <ThemedText
                  style={[styles.statusChipText, { color: status === opt.value ? '#fff' : colors.text }]}
                >
                  {opt.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

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
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  statusChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 14,
    fontWeight: '500',
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
