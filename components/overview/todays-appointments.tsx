import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

import { OverviewCard } from './overview-card';

import type { Appointment } from '@/types/appointment';

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

type TodaysAppointmentsProps = {
  appointments: Appointment[];
};

export function TodaysAppointments({ appointments }: TodaysAppointmentsProps) {
  const iconColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'icon');

  return (
    <OverviewCard>
      <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
        Today&apos;s Appointments
      </ThemedText>
      {appointments.length === 0 ? (
        <ThemedText style={{ opacity: 0.7 }}>No appointments today</ThemedText>
      ) : (
        <View style={styles.list}>
          {appointments.map((apt) => (
            <View key={apt.id} style={styles.row}>
              <View style={[styles.dateBadge, { backgroundColor: iconColor + '20' }]}>
                <ThemedText style={styles.dateText}>{formatDateLabel(apt.date)}</ThemedText>
              </View>
              <View style={styles.details}>
                <ThemedText type="defaultSemiBold">{apt.name}</ThemedText>
                <ThemedText style={styles.time}>
                  {apt.startTime} to {apt.endTime}
                </ThemedText>
                <ThemedText style={styles.status}>Status: {apt.status}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}
    </OverviewCard>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dateBadge: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    minWidth: 44,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 10,
    fontWeight: '600',
  },
  details: {
    flex: 1,
    gap: 2,
  },
  time: {
    fontSize: 14,
    opacity: 0.9,
  },
  status: {
    fontSize: 12,
    opacity: 0.7,
    textTransform: 'capitalize',
  },
});
