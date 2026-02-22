import { Dimensions, StyleSheet, View } from 'react-native';
import { StackedBarChart } from 'react-native-chart-kit';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

import { OverviewCard } from './overview-card';

import type { WeeklyDataItem } from '@/types/appointment';

// Match legend and status colors (same as pie chart / use-appointments)
const SCHEDULED_COLOR = '#3b82f6';   // blue
const CONFIRMED_COLOR = '#10b981';  // green
const COMPLETED_COLOR = '#6366f1';  // indigo

const LEGEND_ITEMS = [
  { label: 'Scheduled', color: SCHEDULED_COLOR },
  { label: 'Confirmed', color: CONFIRMED_COLOR },
  { label: 'Completed', color: COMPLETED_COLOR },
] as const;

type AppointmentsBarChartProps = {
  weeklyData: WeeklyDataItem[];
};

const PAGE_PADDING = 20;
const CARD_PADDING = 20;

export function AppointmentsBarChart({
  weeklyData,
}: AppointmentsBarChartProps) {
  const legendColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  const screenWidth = Dimensions.get('window').width ?? 300;
  const chartWidth = screenWidth - PAGE_PADDING * 2 - CARD_PADDING * 2;

  const labels = weeklyData?.map((d) => d.date) ?? [];
  // One bar per day; each bar has 3 segments: [scheduled, confirmed, completed]
  const dataByDay = (weeklyData ?? []).map((d) => [
    Math.max(0, d.appointments - d.confirmed - d.completed),
    d.confirmed,
    d.completed,
  ]);

  const stackedData = {
    labels,
    legend: ['Scheduled', 'Confirmed', 'Completed'],
    data: dataByDay,
    barColors: [SCHEDULED_COLOR, CONFIRMED_COLOR, COMPLETED_COLOR],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: () => '#374151',
    labelColor: () => '#374151',
    barPercentage: 0.5,
    propsForLabels: { fontSize: 11 },
    // Hide dotted grid lines
    propsForBackgroundLines: { stroke: 'transparent' },
  };

  return (
    <OverviewCard>
      <ThemedText style={styles.cardTitle}>
        Appointments - Last 7 Days
      </ThemedText>
      <View
        style={[
          styles.chartWrap,
          {
            width: chartWidth + CARD_PADDING * 2,
            marginHorizontal: -CARD_PADDING,
          },
        ]}
      >
        <StackedBarChart
          data={stackedData}
          width={chartWidth + CARD_PADDING * 2}
          height={160}
          chartConfig={chartConfig}
          hideLegend={true}
        />
        <View style={styles.legend}>
          {LEGEND_ITEMS.map((item) => (
            <View key={item.label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <ThemedText style={[styles.legendText, { color: legendColor }]}>
                {item.label}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
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
  chartWrap: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    paddingHorizontal: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
});
