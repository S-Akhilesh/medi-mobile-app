# Firestore: Appointments collection

The overview dashboard reads from a Firestore collection named **`appointments`**.

## Collection: `appointments`

Each document should have:

| Field      | Type   | Description                    |
|-----------|--------|--------------------------------|
| `date`    | string | Date as `YYYY-MM-DD`           |
| `startTime` | string | Start time, e.g. `15:00`    |
| `endTime` | string | End time, e.g. `15:30`         |
| `name`    | string | Patient or doctor name         |
| `status`  | string | `"confirmed"` or `"scheduled"` |

## Index

Create a composite index in Firebase Console → Firestore → Indexes:

- **Collection:** `appointments`
- **Fields:** `date` (Ascending)

If you use a different collection name or field names, update `APPOINTMENTS_COLLECTION` and the field mappings in `hooks/use-appointments.ts` and `types/appointment.ts`.
