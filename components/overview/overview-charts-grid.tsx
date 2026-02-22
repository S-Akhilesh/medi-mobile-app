import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppointmentsBarChart } from './appointments-bar-chart';
import { StatusPieChart } from './status-pie-chart';
import { TodaysAppointments } from './todays-appointments';
import { WeeklyTrendChart } from './weekly-trend-chart';

import type {
  Appointment,
  MonthlyDataItem,
  StatusDataItem,
  WeeklyDataItem,
} from '@/types/appointment';

type OverviewChartsGridProps = {
  statusData: StatusDataItem[];
  todayAppointments: Appointment[];
  weeklyData: WeeklyDataItem[];
  monthlyData: MonthlyDataItem[];
};

export default function OverviewChartsGrid({
  statusData,
  todayAppointments,
  weeklyData,
  monthlyData,
}: OverviewChartsGridProps) {
  const sectionColor = useThemeColor(
    { light: '#64748b', dark: '#94a3b8' },
    'icon',
  );

  return (
    <View style={styles.wrapper}>
      <ThemedText style={[styles.sectionLabel, { color: sectionColor }]}>
        OVERVIEW
      </ThemedText>
      <View style={styles.column}>
        <StatusPieChart statusData={statusData} />
        <TodaysAppointments appointments={todayAppointments} />
        <AppointmentsBarChart weeklyData={weeklyData} />
        <WeeklyTrendChart monthlyData={monthlyData} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  column: {
    gap: 20,
  },
});
