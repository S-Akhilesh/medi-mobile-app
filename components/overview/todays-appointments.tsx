import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

import { OverviewCard } from './overview-card';

import type { Appointment, AppointmentStatus } from '@/types/appointment';

const STATUS_PILL_COLORS: Record<
  AppointmentStatus,
  { bg: string; text: string }
> = {
  scheduled: { bg: '#3b82f6', text: '#3b82f6' },
  confirmed: { bg: '#10b981', text: '#10b981' },
  completed: { bg: '#6366f1', text: '#6366f1' },
  cancelled: { bg: '#ef4444', text: '#ef4444' },
  'no-show': { bg: '#f59e0b', text: '#f59e0b' },
};

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    .toUpperCase();
}

function formatStatusLabel(status: AppointmentStatus): string {
  return status === 'no-show'
    ? 'No-show'
    : status.charAt(0).toUpperCase() + status.slice(1);
}

type TodaysAppointmentsProps = {
  appointments: Appointment[];
};

export function TodaysAppointments({ appointments }: TodaysAppointmentsProps) {
  const colorScheme = useColorScheme();
  const iconColor = useThemeColor(
    { light: '#64748b', dark: '#94a3b8' },
    'icon',
  );
  const borderColor = useThemeColor(
    { light: '#e2e8f0', dark: '#2d3238' },
    'icon',
  );
  const colors = Colors[colorScheme ?? 'light'];

  const getStatusStyle = (status: AppointmentStatus) => {
    const c = STATUS_PILL_COLORS[status];
    return { backgroundColor: c.bg + '20', color: c.text };
  };

  return (
    <OverviewCard>
      <ThemedText style={styles.cardTitle}>
        Today&apos;s Appointments
      </ThemedText>
      {appointments.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyText, { color: iconColor }]}>
            No appointments scheduled for today
          </ThemedText>
        </View>
      ) : (
        <View style={styles.list}>
          {appointments.map((apt, index) => (
            <View key={apt.id ?? apt.slotId ?? index.toString()}>
              {index > 0 ? (
                <View
                  style={[styles.divider, { backgroundColor: borderColor }]}
                />
              ) : null}
              <View style={styles.row}>
                <View
                  style={[
                    styles.dateBadge,
                    { backgroundColor: colors.tint + '20' },
                  ]}
                >
                  <ThemedText style={[styles.dateText, { color: colors.tint }]}>
                    {formatDateLabel(apt.date)}
                  </ThemedText>
                </View>
                <View style={styles.details}>
                  <ThemedText type='defaultSemiBold' style={styles.name}>
                    {apt.patientName}
                  </ThemedText>
                  <ThemedText style={[styles.time, { color: iconColor }]}>
                    {apt.startTime} – {apt.endTime}
                  </ThemedText>
                </View>
                <View style={[styles.statusPill, getStatusStyle(apt.status)]}>
                  <ThemedText
                    style={[
                      styles.statusText,
                      { color: STATUS_PILL_COLORS[apt.status].text },
                    ]}
                  >
                    {formatStatusLabel(apt.status)}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </OverviewCard>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 12,
    opacity: 0.9,
  },
  emptyState: {
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 16,
  },
  list: {
    gap: 0,
    width: '100%',
    alignSelf: 'stretch',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
    marginLeft: 56,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dateBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    minWidth: 48,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  details: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  name: {
    fontSize: 17,
  },
  time: {
    fontSize: 15,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
