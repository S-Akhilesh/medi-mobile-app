export type AppointmentStatus = 'confirmed' | 'scheduled';

export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  name: string;
  status: AppointmentStatus;
}

export interface AppointmentStatusCounts {
  confirmed: number;
  scheduled: number;
}

export interface DayCount {
  day: string;
  confirmed: number;
  scheduled: number;
}

export interface WeekCount {
  weekLabel: string;
  total: number;
}
