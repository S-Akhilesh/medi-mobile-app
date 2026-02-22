import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
import { slotsService } from '@/lib/slots-service';

function formatDateForInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isValidTime(s: string): boolean {
  return /^([01]?\d|2[0-3]):[0-5]\d$/.test(s);
}

function timeToMinutes(s: string): number {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Generate slot segments from start to end with given duration (minutes). */
function generateSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): { startTime: string; endTime: string; duration: number }[] {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  const slots: { startTime: string; endTime: string; duration: number }[] = [];
  for (let m = startMins; m + durationMinutes <= endMins; m += durationMinutes) {
    slots.push({
      startTime: minutesToTime(m),
      endTime: minutesToTime(m + durationMinutes),
      duration: durationMinutes,
    });
  }
  return slots;
}

export default function CreateSlotScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('');

  const doctorId = user?.uid ?? '';
  const doctorName = user?.displayName ?? user?.email ?? 'Doctor';

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
      }
    },
    []
  );

  async function handleSubmit() {
    const dateTrim = date.trim();
    const start = startTime.trim();
    const end = endTime.trim();
    const durationStr = duration.trim();

    if (!dateTrim) {
      Alert.alert('Required', 'Please select a date.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateTrim)) {
      Alert.alert('Invalid date', 'Use format YYYY-MM-DD.');
      return;
    }
    if (!start) {
      Alert.alert('Required', 'Please enter start time (HH:MM).');
      return;
    }
    if (!isValidTime(start)) {
      Alert.alert('Invalid time', 'Use 24-hour format HH:MM (e.g. 09:00).');
      return;
    }
    if (!end) {
      Alert.alert('Required', 'Please enter end time (HH:MM).');
      return;
    }
    if (!isValidTime(end)) {
      Alert.alert('Invalid time', 'Use 24-hour format HH:MM (e.g. 18:45).');
      return;
    }
    if (timeToMinutes(end) <= timeToMinutes(start)) {
      Alert.alert('Invalid range', 'End time must be after start time.');
      return;
    }
    if (!durationStr) {
      Alert.alert('Required', 'Please enter slot duration (minutes).');
      return;
    }
    const durationNum = parseInt(durationStr, 10);
    if (!Number.isInteger(durationNum) || durationNum < 1 || durationNum > 240) {
      Alert.alert('Invalid duration', 'Enter a whole number between 1 and 240 minutes.');
      return;
    }

    const segments = generateSlots(start, end, durationNum);
    if (segments.length === 0) {
      Alert.alert('Invalid range', 'No full slots fit between start and end time with this duration.');
      return;
    }

    if (!doctorId) {
      Alert.alert('Error', 'You must be signed in to create slots.');
      return;
    }

    setSubmitting(true);
    try {
      for (const seg of segments) {
        await slotsService.createSlot({
          doctorId,
          doctorName,
          date: dateTrim,
          startTime: seg.startTime,
          endTime: seg.endTime,
          duration: seg.duration,
          available: true,
        });
      }
      Alert.alert('Success', `${segments.length} slot(s) created.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert(
        'Error',
        e instanceof Error ? e.message : 'Failed to create slots'
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
          <AuthenticatedHeader subtitle="New slots" />

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

          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            Start time * (HH:MM 24h)
          </ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="e.g. 18:30"
            placeholderTextColor={colors.textSecondary}
            value={startTime}
            onChangeText={setStartTime}
            editable={!submitting}
          />

          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            End time * (HH:MM 24h)
          </ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="e.g. 19:45"
            placeholderTextColor={colors.textSecondary}
            value={endTime}
            onChangeText={setEndTime}
            editable={!submitting}
          />

          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            Slot duration * (minutes)
          </ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="e.g. 15"
            placeholderTextColor={colors.textSecondary}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
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
            <ThemedText style={styles.submitBtnText}>
              {submitting ? 'Creating…' : 'Create slots'}
            </ThemedText>
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
  container: { flex: 1 },
  keyboard: { flex: 1 },
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
  dateTouchable: { justifyContent: 'center' },
  iosDatePickerActions: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  iosDatePickerBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  iosDatePickerBtnText: { fontSize: 16, fontWeight: '600' },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnPressed: { opacity: 0.8 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  cancelBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 16 },
});
