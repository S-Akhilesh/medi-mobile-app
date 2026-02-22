import { router } from 'expo-router';
import React, { Suspense, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorBoundary } from '@/components/error-boundary';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useAppointmentsOverview } from '@/hooks/use-appointments';

const OverviewChartsGrid = React.lazy(
  () => import('@/components/overview/overview-charts-grid')
);

export default function OverviewScreen() {
  const { user, signOut } = useAuth();
  const {
    todayAppointments,
    statusDistribution,
    last7Days,
    last4Weeks,
    loading,
    error,
  } = useAppointmentsOverview();
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
          <ThemedText type="title">Overview</ThemedText>
          <ThemedText style={styles.subtitle}>
            {user?.email ? `Signed in as ${user.email}` : 'You are signed in'}
          </ThemedText>
        </View>

        {error ? (
          <ThemedText style={styles.error}>{error}</ThemedText>
        ) : null}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        ) : !chartsReady ? (
          <View style={styles.loading}>
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <ErrorBoundary>
            <Suspense fallback={<View style={styles.loading}><ActivityIndicator size="small" /></View>}>
              <OverviewChartsGrid
                statusDistribution={statusDistribution}
                todayAppointments={todayAppointments ?? []}
                last7Days={last7Days ?? []}
                last4Weeks={last4Weeks ?? []}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        <Pressable
          onPress={async () => {
            await signOut();
            router.replace('/(auth)/login');
          }}
          style={({ pressed }) => [styles.signOutButton, pressed && styles.buttonPressed]}
        >
          <ThemedText type="link">Sign out</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.8,
    fontSize: 15,
  },
  error: {
    color: '#dc2626',
    marginBottom: 16,
  },
  loading: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  grid: {
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
  },
  gridCell: {
    flex: 1,
    minWidth: 0,
  },
  signOutButton: {
    alignSelf: 'flex-start',
    marginTop: 24,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
