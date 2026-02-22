import { Dimensions, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

import { OverviewCard } from './overview-card';

import type { AppointmentStatusCounts } from '@/types/appointment';

const CONFIRMED_COLOR = '#22c55e';
const SCHEDULED_COLOR = '#3b82f6';

const chartConfig = {
  color: (opacity: number) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity: number) => `rgba(0, 0, 0, ${opacity})`,
};

type StatusPieChartProps = {
  distribution: AppointmentStatusCounts;
};

export function StatusPieChart({ distribution }: StatusPieChartProps) {
  const legendFontColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  const total = distribution.confirmed + distribution.scheduled;
  const data = [
    {
      name: 'Confirmed',
      population: total > 0 ? Math.round((distribution.confirmed / total) * 100) : 50,
      color: CONFIRMED_COLOR,
      legendFontColor,
      legendFontSize: 12,
    },
    {
      name: 'Scheduled',
      population: total > 0 ? Math.round((distribution.scheduled / total) * 100) : 50,
      color: SCHEDULED_COLOR,
      legendFontColor,
      legendFontSize: 12,
    },
  ].filter((d) => d.population > 0);

  if (data.length === 0) {
    data.push(
      { name: 'Confirmed', population: 50, color: CONFIRMED_COLOR, legendFontColor, legendFontSize: 12 },
      { name: 'Scheduled', population: 50, color: SCHEDULED_COLOR, legendFontColor, legendFontSize: 12 }
    );
  }

  const windowWidth = Dimensions.get('window').width ?? 300;
  const size = Math.max(100, Math.min(windowWidth * 0.4, 160));

  return (
    <OverviewCard>
      <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
        Appointment Status Distribution
      </ThemedText>
      <View style={{ alignItems: 'center' }}>
        <PieChart
          data={data}
          width={size}
          height={size}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="10"
          chartConfig={chartConfig}
          absolute={false}
          hasLegend
        />
      </View>
    </OverviewCard>
  );
}
