import { Dimensions, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

import { OverviewCard } from './overview-card';

import type { WeekCount } from '@/types/appointment';

const LINE_COLOR = '#3b82f6';

type WeeklyTrendChartProps = {
  last4Weeks: WeekCount[];
};

export function WeeklyTrendChart({ last4Weeks }: WeeklyTrendChartProps) {
  const labelColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  const screenWidth = Dimensions.get('window').width ?? 300;
  const chartWidth = Math.max(120, Math.min((screenWidth - 24 * 2 - 16) / 2 - 24, 180));

  const weeks = last4Weeks ?? [];
  const labels = weeks.map((w) => w.weekLabel);
  const values = weeks.map((w) => w.total);

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: () => LINE_COLOR,
    labelColor: () => labelColor,
    strokeWidth: 2,
    propsForDots: { r: '4', strokeWidth: '2', stroke: LINE_COLOR },
    propsForLabels: { fontSize: 9 },
  };

  return (
    <OverviewCard>
      <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
        Weekly Trend (Last 4 Weeks)
      </ThemedText>
      <LineChart
        data={{
          labels: labels.length ? labels : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{ data: values.length >= 2 ? values : [0, 0, 0, 0] }],
        }}
        width={chartWidth}
        height={140}
        chartConfig={chartConfig}
        bezier
        fromZero
        withInnerLines={false}
        withDots
        style={{ marginLeft: -8 }}
      />
    </OverviewCard>
  );
}
