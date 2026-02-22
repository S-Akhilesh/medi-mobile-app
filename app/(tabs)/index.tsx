import { router } from 'expo-router';
import React, { Suspense, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorBoundary } from '@/components/error-boundary';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAppointmentsOverview } from '@/hooks/use-appointments';
import { useColorScheme } from '@/hooks/use-color-scheme';

const OverviewChartsGrid = React.lazy(
  () => import('@/components/overview/overview-charts-grid')
);

function truncateEmail(email: string, maxLength = 28) {
  if (email.length <= maxLength) return email;
  return email.slice(0, maxLength - 3) + '...';
}

export default function OverviewScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user, signOut } = useAuth();
  const {
    todayAppointments,
    statusData,
    weeklyData,
    monthlyData,
    loading,
    error,
  } = useAppointmentsOverview(user?.uid);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setChartsReady(true), 100);
      return () => clearTimeout(t);
    } else {
      setChartsReady(false);
    }
  }, [loading]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <ThemedText type="title" style={styles.title}>
                Dashboard
              </ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Appointments at a glance
              </ThemedText>
            </View>
            <Pressable
              onPress={async () => {
                await signOut();
                router.replace('/(auth)/login');
              }}
              style={({ pressed }) => [
                styles.signOutBtn,
                { borderColor: colors.cardBorder },
                pressed && styles.buttonPressed,
              ]}
            >
              <ThemedText style={[styles.signOutLabel, { color: colors.tint }]}>
                Sign out
              </ThemedText>
            </Pressable>
          </View>
          {user?.email ? (
            <View style={[styles.userPill, { backgroundColor: colors.tint + '18' }]}>
              <ThemedText
                style={[styles.userPillText, { color: colors.tint }]}
                numberOfLines={1}
              >
                {truncateEmail(user.email)}
              </ThemedText>
            </View>
          ) : null}
        </View>

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: '#fef2f2' }]}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={[styles.loadingLabel, { color: colors.textSecondary }]}>
              Loading overview…
            </ThemedText>
          </View>
        ) : !chartsReady ? (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color={colors.tint} />
          </View>
        ) : (
          <ErrorBoundary>
            <Suspense
              fallback={
                <View style={styles.loading}>
                  <ActivityIndicator size="small" color={colors.tint} />
                </View>
              }
            >
              <OverviewChartsGrid
                statusData={statusData ?? []}
                todayAppointments={todayAppointments ?? []}
                weeklyData={weeklyData ?? []}
                monthlyData={monthlyData ?? []}
              />
            </Suspense>
          </ErrorBoundary>
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
  header: {
    marginBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 17,
    marginTop: 4,
    fontWeight: '500',
  },
  signOutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  signOutLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  userPill: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 14,
  },
  userPillText: {
    fontSize: 15,
    fontWeight: '500',
  },
  buttonPressed: {
    opacity: 0.8,
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
    paddingVertical: 56,
    alignItems: 'center',
    gap: 12,
  },
  loadingLabel: {
    fontSize: 16,
  },
});
