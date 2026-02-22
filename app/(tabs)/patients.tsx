import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
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
import { usePatients } from '@/hooks/use-appointments';
import { useColorScheme } from '@/hooks/use-color-scheme';

import type { AppointmentStatus } from '@/types/appointment';

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

export default function PatientsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  const { patients, loading, error, refetch } = usePatients(user?.uid);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

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
        <AuthenticatedHeader subtitle='' />

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: '#fef2f2' }]}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : null}

        {loading && patients.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator size='large' color={colors.tint} />
            <ThemedText
              style={[styles.loadingLabel, { color: colors.textSecondary }]}
            >
              Loading patients…
            </ThemedText>
          </View>
        ) : patients.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              No patients yet. Patients will appear here once you have
              appointments.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.list}>
            {patients.map((patient, index) => (
              <View
                key={patient.patientPhone || patient.patientName || index}
                style={[styles.card, { borderColor: colors.cardBorder }]}
              >
                <ThemedText style={styles.patientName}>
                  {patient.patientName || '—'}
                </ThemedText>
                {patient.patientPhone ? (
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.label}>Phone</ThemedText>
                    <ThemedText style={styles.value}>
                      {patient.patientPhone}
                    </ThemedText>
                  </View>
                ) : null}
                {patient.patientEmail ? (
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.label}>Email</ThemedText>
                    <ThemedText style={styles.value} numberOfLines={1}>
                      {patient.patientEmail}
                    </ThemedText>
                  </View>
                ) : null}
                <ThemedText
                  style={[
                    styles.appointmentsSectionLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Appointments ({patient.appointmentCount})
                </ThemedText>
                {patient.appointments.map((apt, aptIndex) => {
                  const style = STATUS_PILL_COLORS[apt.status];
                  return (
                    <View
                      key={`${apt.date}-${apt.startTime}-${aptIndex}`}
                      style={[
                        styles.aptRow,
                        { borderColor: colors.cardBorder },
                      ]}
                    >
                      <View style={styles.aptLeft}>
                        <ThemedText style={styles.aptDate}>
                          {formatDateFull(apt.date)}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.aptTime,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {apt.startTime} – {apt.endTime}
                        </ThemedText>
                      </View>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: style.bg + '20' },
                        ]}
                      >
                        <ThemedText
                          style={[styles.statusText, { color: style.text }]}
                        >
                          {formatStatusLabel(apt.status)}
                        </ThemedText>
                      </View>
                    </View>
                  );
                })}
              </View>
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
  patientName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
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
  appointmentsSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 8,
  },
  aptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  aptLeft: {
    flex: 1,
  },
  aptDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  aptTime: {
    fontSize: 13,
    marginTop: 2,
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
});
