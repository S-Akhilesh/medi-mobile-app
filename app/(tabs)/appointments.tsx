import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
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
import { appointmentsService } from '@/lib/appointments-service';

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

type StatusFilter = AppointmentStatus | 'all';

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

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
  onConfirm,
  onComplete,
  onCancel,
  actionLoading,
}: {
  apt: Appointment;
  colors: (typeof Colors)['light'];
  onConfirm: (apt: Appointment) => void;
  onComplete: (apt: Appointment) => void;
  onCancel: (apt: Appointment) => void;
  actionLoading: boolean;
}) {
  const statusStyle = {
    backgroundColor: STATUS_PILL_COLORS[apt.status].bg + '20',
  };
  const statusTextColor = STATUS_PILL_COLORS[apt.status].text;
  const canConfirm = apt.status === 'scheduled';
  const canCompleteOrCancel =
    apt.status === 'scheduled' || apt.status === 'confirmed';

  return (
    <View style={[styles.card, { borderColor: colors.cardBorder }]}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.dateLabel}>
          {formatDateFull(apt.date)}
        </ThemedText>
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
        <View
          style={[styles.notesWrap, { backgroundColor: colors.cardBackground }]}
        >
          <ThemedText style={styles.label}>Notes</ThemedText>
          <ThemedText style={styles.notesText}>{apt.notes.trim()}</ThemedText>
        </View>
      ) : null}

      <View style={styles.actions}>
        {canConfirm && (
          <Pressable
            onPress={() => onConfirm(apt)}
            disabled={actionLoading}
            style={({ pressed }) => [
              styles.actionBtn,
              styles.actionBtnPrimary,
              { backgroundColor: colors.tint },
              pressed && styles.actionBtnPressed,
            ]}
          >
            <ThemedText style={styles.actionBtnTextPrimary}>Confirm</ThemedText>
          </Pressable>
        )}
        {canCompleteOrCancel && (
          <Pressable
            onPress={() => onComplete(apt)}
            disabled={actionLoading}
            style={({ pressed }) => [
              styles.actionBtn,
              styles.actionBtnPrimary,
              { backgroundColor: colors.tint },
              pressed && styles.actionBtnPressed,
            ]}
          >
            <ThemedText style={styles.actionBtnTextPrimary}>Complete</ThemedText>
          </Pressable>
        )}
        {canCompleteOrCancel && (
          <Pressable
            onPress={() => onCancel(apt)}
            disabled={actionLoading}
            style={({ pressed }) => [
              styles.actionBtn,
              { borderColor: colors.cardBorder },
              pressed && styles.actionBtnPressed,
            ]}
          >
            <ThemedText style={[styles.actionBtnText, { color: colors.text }]}>
              Cancel
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  const { appointments, loading, error, refetch } = useAllAppointments(
    user?.uid,
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'all') return appointments;
    return appointments.filter((apt) => apt.status === statusFilter);
  }, [appointments, statusFilter]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleConfirm = async (apt: Appointment) => {
    if (!apt.id) return;
    setActionLoading(true);
    try {
      await appointmentsService.updateAppointment(apt.id, { status: 'confirmed' });
      await refetch();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (apt: Appointment) => {
    if (!apt.id) return;
    setActionLoading(true);
    try {
      await appointmentsService.updateAppointment(apt.id, { status: 'completed' });
      await refetch();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (apt: Appointment) => {
    if (!apt.id) return;
    setActionLoading(true);
    try {
      await appointmentsService.updateAppointment(apt.id, { status: 'cancelled' });
      await refetch();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={colors.tint}
          />
        }
      >
        <AuthenticatedHeader subtitle='Manage your appointments' />

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: '#fef2f2' }]}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : null}

        {!loading && appointments.length > 0 ? (
          <>
            <ThemedText style={[styles.filterLabel, { color: colors.textSecondary }]}>
              Status
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              style={styles.filterScroll}
            >
              {STATUS_FILTER_OPTIONS.map((opt) => {
                const isActive = statusFilter === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setStatusFilter(opt.value)}
                    style={[
                      styles.filterChip,
                      {
                        borderColor: colors.cardBorder,
                        backgroundColor: isActive ? colors.tint : colors.cardBackground,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.filterChipText,
                        { color: isActive ? '#fff' : colors.text },
                      ]}
                    >
                      {opt.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        ) : null}

        {loading && appointments.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator size='large' color={colors.tint} />
            <ThemedText
              style={[styles.loadingLabel, { color: colors.textSecondary }]}
            >
              Loading appointments…
            </ThemedText>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              No appointments found
            </ThemedText>
          </View>
        ) : filteredAppointments.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              No appointments match the selected filters
            </ThemedText>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredAppointments.map((apt, index) => (
              <AppointmentCard
                key={apt.id ?? apt.slotId ?? index.toString()}
                apt={apt}
                colors={colors}
                onConfirm={handleConfirm}
                onComplete={handleComplete}
                onCancel={handleCancel}
                actionLoading={actionLoading}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/(tabs)/create-appointment')}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.tint },
          pressed && styles.fabPressed,
        ]}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </Pressable>
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
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabPressed: {
    opacity: 0.8,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  filterScroll: {
    marginHorizontal: -20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnPrimary: {
    borderWidth: 0,
  },
  actionBtnPressed: {
    opacity: 0.8,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionBtnTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
