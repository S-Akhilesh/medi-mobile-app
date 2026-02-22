import { Dimensions, View } from 'react-native';
import { StackedBarChart } from 'react-native-chart-kit';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

import { OverviewCard } from './overview-card';

import type { DayCount } from '@/types/appointment';

const CONFIRMED_COLOR = '#22c55e';
const SCHEDULED_COLOR = '#3b82f6';

type AppointmentsBarChartProps = {
  last7Days: DayCount[];
};

export function AppointmentsBarChart({ last7Days }: AppointmentsBarChartProps) {
  const labelColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  const screenWidth = Dimensions.get('window').width ?? 300;
  const chartWidth = Math.max(120, Math.min((screenWidth - 24 * 2 - 16) / 2 - 24, 180));

  const labels = last7Days?.map((d) => d.day) ?? [];
  const stackedData = {
    labels,
    legend: ['Scheduled', 'Confirmed'],
    data: [
      (last7Days ?? []).map((d) => d.scheduled),
      (last7Days ?? []).map((d) => d.confirmed),
    ],
    barColors: [SCHEDULED_COLOR, CONFIRMED_COLOR],
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: () => labelColor,
    labelColor: () => labelColor,
    barPercentage: 0.5,
    propsForLabels: { fontSize: 9 },
  };

  return (
    <OverviewCard>
      <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
        Appointments - Last 7 Days
      </ThemedText>
      <StackedBarChart
        data={stackedData}
        width={chartWidth}
        height={140}
        chartConfig={chartConfig}
        hideLegend={false}
        withInnerLines={false}
        style={{ marginLeft: -8 }}
      />
    </OverviewCard>
  );
}
