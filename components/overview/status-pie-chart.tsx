import { StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

import { OverviewCard } from './overview-card';

import type { StatusDataItem } from '@/types/appointment';

const chartConfig = {
  color: (opacity: number) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity: number) => `rgba(0, 0, 0, ${opacity})`,
};

type StatusPieChartProps = {
  statusData: StatusDataItem[];
};

const CHART_PADDING = 24;
const PIE_SIZE = 140;

export function StatusPieChart({ statusData }: StatusPieChartProps) {
  const legendFontColor = useThemeColor(
    { light: '#11181C', dark: '#ECEDEE' },
    'text',
  );
  const size = PIE_SIZE;

  const data = statusData
    .filter((d) => d.value > 0)
    .map((d) => ({
      name: d.name,
      population: d.value,
      color: d.color,
      legendFontColor,
      legendFontSize: 12,
    }));

  if (data.length === 0) {
    data.push({
      name: 'No data',
      population: 1,
      color: '#94a3b8',
      legendFontColor,
      legendFontSize: 12,
    });
  }

  return (
    <OverviewCard overflowVisible>
      <ThemedText style={styles.cardTitle}>
        Appointment Status Distribution
      </ThemedText>
      <View style={styles.chartWrap}>
        <PieChart
          data={data}
          width={150}
          height={150}
          accessor='population'
          backgroundColor='transparent'
          paddingLeft='30'
          chartConfig={chartConfig}
          absolute={false}
          hasLegend={false}
        />
        <View style={styles.legend}>
          {data.map((item) => (
            <View key={item.name} style={styles.legendRow}>
              <View
                style={[styles.legendDot, { backgroundColor: item.color }]}
              />
              <ThemedText
                style={[styles.legendText, { color: legendFontColor }]}
              >
                {item.name}: {item.population}
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
    width: '100%',
    maxWidth: '100%',
    alignItems: 'center',
    paddingHorizontal: CHART_PADDING,
    paddingBottom: CHART_PADDING,
  },
  pieClip: {
    overflow: 'hidden',
    borderRadius: 9999,
    alignSelf: 'center',
    flexShrink: 0,
  },
  legend: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 4,
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
    fontSize: 14,
  },
});
