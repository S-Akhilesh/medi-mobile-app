# Firestore: Appointments collection

The overview dashboard reads from a Firestore collection named **`appointments`** and derives chart data from it (statusData, weeklyData, monthlyData, todayAppointments).

## Collection: `appointments`

Each document should match the **Appointment** type (aligned with API `getAppointmentsByDoctor`):

| Field          | Type   | Description                          |
|----------------|--------|--------------------------------------|
| `slotId`       | string | Slot / booking id                    |
| `patientName`  | string | Patient name (fallback: `name`)      |
| `patientPhone` | string | Patient phone                        |
| `patientEmail` | string | Optional                              |
| `date`         | string | `YYYY-MM-DD`                         |
| `startTime`    | string | e.g. `15:00`                         |
| `endTime`      | string | e.g. `15:30`                         |
| `doctorId`     | string | **Required.** Doctor’s Firebase Auth UID. The overview fetches only appointments where `doctorId` equals the signed-in user’s UID. |
| `doctorName`   | string | Doctor name                          |
| `status`       | string | One of: `scheduled`, `confirmed`, `completed`, `cancelled`, `no-show` |
| `notes`        | string | Optional                              |
| `createdAt`    | string | Optional                              |
| `updatedAt`    | string | Optional                              |

## How data is used

- **PieChart** – Counts by `status` → statusData: `{ name, value, color }` (Scheduled, Confirmed, Completed, Cancelled, No-show).
- **BarChart** – Last 7 days: per day `appointments`, `confirmed`, `completed` (weeklyData).
- **LineChart** – Last 4 weeks: total appointments per week (monthlyData).
- **Today’s list** – Appointments where `date === today`; shows `patientName`, `startTime`, `endTime`, `status`.

## Index

Create a composite index in Firebase Console → Firestore → Indexes:

- **Collection:** `appointments`
- **Fields:** `doctorId` (Ascending), `date` (Ascending), `startTime` (Ascending)

This index is required for `getAppointmentsByDoctor` (used by the overview).

The app uses `lib/appointments-service.ts` for all appointment CRUD; the overview hook calls `getAppointmentsByDoctor(doctorId)` and filters to the last 28 days in memory.
