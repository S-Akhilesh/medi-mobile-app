import { StyleSheet, View } from 'react-native';

import { AppointmentsBarChart } from './appointments-bar-chart';
import { StatusPieChart } from './status-pie-chart';
import { TodaysAppointments } from './todays-appointments';
import { WeeklyTrendChart } from './weekly-trend-chart';

import type { Appointment, AppointmentStatusCounts, DayCount, WeekCount } from '@/types/appointment';

type OverviewChartsGridProps = {
  statusDistribution: AppointmentStatusCounts;
  todayAppointments: Appointment[];
  last7Days: DayCount[];
  last4Weeks: WeekCount[];
};

export default function OverviewChartsGrid({
  statusDistribution,
  todayAppointments,
  last7Days,
  last4Weeks,
}: OverviewChartsGridProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.gridRow}>
        <View style={styles.gridCell}>
          <StatusPieChart distribution={statusDistribution} />
        </View>
        <View style={styles.gridCell}>
          <TodaysAppointments appointments={todayAppointments} />
        </View>
      </View>
      <View style={styles.gridRow}>
        <View style={styles.gridCell}>
          <AppointmentsBarChart last7Days={last7Days} />
        </View>
        <View style={styles.gridCell}>
          <WeeklyTrendChart last4Weeks={last4Weeks} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 16 },
  gridRow: { flexDirection: 'row', gap: 16 },
  gridCell: { flex: 1, minWidth: 0 },
});
