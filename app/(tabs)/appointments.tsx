import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AuthenticatedHeader } from '@/components/authenticated-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAllAppointments } from '@/hooks/use-appointments';
import { useColorScheme } from '@/hooks/use-color-scheme';

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

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatStatusLabel(status: AppointmentStatus): string {
  return status === 'no-show'
    ? 'No-show'
    : status.charAt(0).toUpperCase() + status.slice(1);
}

function AppointmentCard({
  apt,
  colors,
}: {
  apt: Appointment;
  colors: (typeof Colors)['light'];
}) {
  const statusStyle = {
    backgroundColor: STATUS_PILL_COLORS[apt.status].bg + '20',
  };
  const statusTextColor = STATUS_PILL_COLORS[apt.status].text;

  return (
    <View style={[styles.card, { borderColor: colors.cardBorder }]}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.dateLabel}>{formatDateFull(apt.date)}</ThemedText>
        <View style={[styles.statusPill, statusStyle]}>
          <ThemedText style={[styles.statusText, { color: statusTextColor }]}>
            {formatStatusLabel(apt.status)}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={styles.timeRange}>
        {apt.startTime} – {apt.endTime}
      </ThemedText>
      <View style={styles.detailRow}>
        <ThemedText style={styles.label}>Patient</ThemedText>
        <ThemedText style={styles.value}>{apt.patientName}</ThemedText>
      </View>
      {apt.patientPhone ? (
        <View style={styles.detailRow}>
          <ThemedText style={styles.label}>Phone</ThemedText>
          <ThemedText style={styles.value}>{apt.patientPhone}</ThemedText>
        </View>
      ) : null}
      {apt.patientEmail ? (
        <View style={styles.detailRow}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <ThemedText style={styles.value} numberOfLines={1}>
            {apt.patientEmail}
          </ThemedText>
        </View>
      ) : null}
      <View style={styles.detailRow}>
        <ThemedText style={styles.label}>Doctor</ThemedText>
        <ThemedText style={styles.value}>{apt.doctorName}</ThemedText>
      </View>
      {apt.notes?.trim() ? (
        <View style={[styles.notesWrap, { backgroundColor: colors.cardBackground }]}>
          <ThemedText style={styles.label}>Notes</ThemedText>
          <ThemedText style={styles.notesText}>{apt.notes.trim()}</ThemedText>
        </View>
      ) : null}
    </View>
  );
}

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  const { appointments, loading, error, refetch } = useAllAppointments(user?.uid);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.tint} />
        }
      >
        <AuthenticatedHeader subtitle="View and manage your appointments" />

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: '#fef2f2' }]}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : null}

        {loading && appointments.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={[styles.loadingLabel, { color: colors.textSecondary }]}>
              Loading appointments…
            </ThemedText>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              No appointments found
            </ThemedText>
          </View>
        ) : (
          <View style={styles.list}>
            {appointments.map((apt, index) => (
              <AppointmentCard
                key={apt.id ?? apt.slotId ?? index.toString()}
                apt={apt}
                colors={colors}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 32,
  },
  errorBanner: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
  },
  loading: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  loadingLabel: {
    fontSize: 16,
  },
  empty: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  list: {
    gap: 16,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeRange: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
    opacity: 0.85,
  },
  detailRow: {
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
  },
  notesWrap: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
