/**
 * Raw appointment from API (getAppointmentsByDoctor).
 */
export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface Appointment {
  id?: string;
  slotId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  doctorId: string;
  doctorName: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** PieChart – "Appointment Status Distribution" */
export interface StatusDataItem {
  name: string;
  value: number;
  color: string;
}

/** BarChart – "Appointments - Last 7 Days" */
export interface WeeklyDataItem {
  date: string; // short weekday, e.g. "Mon"
  fullDate: string; // YYYY-MM-DD
  appointments: number;
  confirmed: number;
  completed: number;
}

/** LineChart – "Weekly Trend (Last 4 Weeks)" */
export interface MonthlyDataItem {
  week: string; // "Week 1" .. "Week 4"
  appointments: number;
}
