import { Dimensions, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { ThemedText } from '@/components/themed-text';

import { OverviewCard } from './overview-card';

import type { MonthlyDataItem } from '@/types/appointment';

const LINE_COLOR = '#3b82f6';
const PAGE_PADDING = 20;
const CARD_PADDING = 20;

type WeeklyTrendChartProps = {
  monthlyData: MonthlyDataItem[];
};

export function WeeklyTrendChart({ monthlyData }: WeeklyTrendChartProps) {
  const screenWidth = Dimensions.get('window').width ?? 300;
  const chartWidth = screenWidth - PAGE_PADDING * 2 - CARD_PADDING * 2 + CARD_PADDING * 2;

  const weeks = monthlyData ?? [];
  const labels = weeks.map((w) => w.week);
  const values = weeks.map((w) => w.appointments);

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: () => LINE_COLOR,
    labelColor: () => '#374151',
    strokeWidth: 2,
    propsForDots: { r: '4', strokeWidth: '2', stroke: LINE_COLOR },
    propsForLabels: { fontSize: 11 },
  };

  return (
    <OverviewCard>
      <ThemedText style={styles.cardTitle}>
        Weekly Trend (Last 4 Weeks)
      </ThemedText>
      <View style={[styles.chartWrap, { width: chartWidth, marginHorizontal: -CARD_PADDING }]}>
        <LineChart
          data={{
            labels: labels.length ? labels : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{ data: values.length >= 2 ? values : [0, 0, 0, 0] }],
          }}
          width={chartWidth}
          height={160}
          chartConfig={chartConfig}
          bezier
          fromZero
          withInnerLines={false}
          withDots
        />
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
});
