import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
import { Collapsible } from '@/components/ui/collapsible';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { slotsService } from '@/lib/slots-service';

import type { Slot } from '@/types/appointment';

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function SlotsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const doctorId = user?.uid ?? '';

  const handleToggleAvailability = useCallback(
    async (slot: Slot) => {
      const next = !(slot.available !== false);
      setTogglingId(slot.id);
      try {
        await slotsService.updateSlotAvailability(slot.id, next);
        setSlots((prev) =>
          prev.map((s) => (s.id === slot.id ? { ...s, available: next } : s))
        );
      } catch (e) {
        Alert.alert(
          'Error',
          e instanceof Error ? e.message : 'Failed to update slot'
        );
      } finally {
        setTogglingId(null);
      }
    },
    []
  );

  const fetchSlots = useCallback(async () => {
    if (!doctorId) {
      setSlots([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await slotsService.getSlotsByDoctor(doctorId);
      setSlots(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load slots');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useFocusEffect(
    useCallback(() => {
      fetchSlots();
    }, [fetchSlots])
  );

  const slotsByDate = React.useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of slots) {
      const list = map.get(slot.date) ?? [];
      list.push(slot);
      map.set(slot.date, list);
    }
    const dates = [...map.keys()].sort((a, b) => b.localeCompare(a));
    return dates.map((date) => ({ date, slots: map.get(date)! }));
  }, [slots]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchSlots}
            tintColor={colors.tint}
          />
        }
      >
        <AuthenticatedHeader subtitle="Your availability" />

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: '#fef2f2' }]}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : null}

        {loading && slots.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={[styles.loadingLabel, { color: colors.textSecondary }]}>
              Loading slots…
            </ThemedText>
          </View>
        ) : slots.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              No slots yet. Add slots in Firebase to show your availability for creating appointments.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.list}>
            {slotsByDate.map(({ date, slots: daySlots }, index) => (
              <Collapsible
                key={date}
                title={formatDateFull(date)}
                defaultOpen={index === 0}
              >
                <View style={styles.slotList}>
                  {daySlots.map((slot) => {
                    const isAvailable = slot.available !== false;
                    const isToggling = togglingId === slot.id;
                    return (
                      <View
                        key={slot.id}
                        style={[styles.slotCard, { borderColor: colors.cardBorder }]}
                      >
                        <ThemedText style={styles.timeRange}>
                          {slot.startTime} – {slot.endTime}
                        </ThemedText>
                        <Pressable
                          onPress={() => handleToggleAvailability(slot)}
                          disabled={isToggling}
                          style={({ pressed }) => [
                            styles.toggleBtn,
                            {
                              backgroundColor: isAvailable
                                ? colors.cardBorder
                                : colors.tint,
                              opacity: pressed || isToggling ? 0.7 : 1,
                            },
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.toggleBtnText,
                              { color: isAvailable ? colors.text : '#fff' },
                            ]}
                          >
                            {isToggling
                              ? '…'
                              : isAvailable
                                ? 'Mark unavailable'
                                : 'Mark available'}
                          </ThemedText>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </Collapsible>
            ))}
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/(tabs)/create-slot')}
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
  fabPressed: { opacity: 0.8 },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
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
  slotList: {
    gap: 8,
  },
  slotCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeRange: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
