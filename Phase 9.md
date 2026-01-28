# LIFTER — Product Requirements Document (PRD)
## MVP Phase 9: Scheduling & Dispatch

---

## 1. Objective

Phase 9 transforms LIFTER from a **record-keeping system** into an **operational dispatch platform**.

Currently, Maintenance records **what happened**. Scheduling will plan **what will happen** — assigning mechanics to jobs with specific dates and times, tracking job progress through status workflows, and providing calendar-based visibility.

This phase enables:
- Forward-planning of service work
- Mechanic availability and workload management
- Real-time job status tracking
- Calendar-based dispatch views

---

## 2. In Scope (Phase 9)

### ✅ Included

1. **ScheduledJob** entity (planned work assignments)
2. **Job status workflow**: Scheduled → En Route → On Site → Completed → (Cancelled)
3. **Calendar views** (day/week/month)
4. **Mechanic availability** (working hours, time off)
5. **Dispatch dashboard** (today's jobs, unassigned queue)
6. **Job-to-Maintenance linking** (completed job creates maintenance record)
7. **Filtering by mechanic, status, date range**

### ❌ Explicitly Excluded (Future Phases)

- Mobile app / PWA
- Push notifications
- GPS tracking / route optimization
- Recurring job templates
- Customer portal
- SMS/Email reminders
- Drag-and-drop calendar editing
- Time estimates / job costing

---

## 3. Tech Stack (Unchanged)

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- Auth.js (NextAuth v5)
- PostgreSQL (Supabase)
- Prisma ORM

---

## 4. Data Model

All tables include `companyId` for multi-tenant isolation.

---

### 4.1 ScheduledJob

Represents a planned work assignment.

**Table: `ScheduledJob`**

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| companyId | uuid | workspace |
| jobCode | string | user-facing (e.g. J-000123) |
| title | string | required, brief description |
| description | text | optional, detailed notes |
| managementCompanyId | uuid | FK → ManagementCompany |
| buildingId | uuid | FK → Building |
| unitId | uuid | FK → Unit (optional) |
| mechanicId | uuid | FK → Mechanic (optional initially) |
| scheduledDate | date | required |
| scheduledStartTime | time | optional (e.g. 09:00) |
| scheduledEndTime | time | optional (e.g. 11:00) |
| status | enum | SCHEDULED, EN_ROUTE, ON_SITE, COMPLETED, CANCELLED |
| priority | enum | LOW, NORMAL, HIGH, URGENT |
| jobType | enum | MAINTENANCE, INSPECTION, EMERGENCY, CALLBACK, OTHER |
| maintenanceId | uuid | FK → Maintenance (linked after completion, optional) |
| completedAt | timestamp | set when status → COMPLETED |
| notes | text | optional, dispatch notes |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**Constraints:**
- `(companyId, jobCode)` unique
- `scheduledDate` required
- If `unitId` provided, must belong to `buildingId`
- If `buildingId` provided, must belong to `managementCompanyId`

---

### 4.2 JobStatus Enum

```prisma
enum JobStatus {
  SCHEDULED    // Job planned, not started
  EN_ROUTE     // Mechanic traveling to site
  ON_SITE      // Mechanic at location, working
  COMPLETED    // Work finished
  CANCELLED    // Job cancelled
}
```

---

### 4.3 JobPriority Enum

```prisma
enum JobPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

---

### 4.4 JobType Enum

```prisma
enum JobType {
  MAINTENANCE
  INSPECTION
  EMERGENCY
  CALLBACK
  OTHER
}
```

---

### 4.5 MechanicAvailability (Optional for Phase 9)

Tracks mechanic working hours and time off.

**Table: `MechanicAvailability`**

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| companyId | uuid | workspace |
| mechanicId | uuid | FK → Mechanic |
| date | date | specific date |
| availableFrom | time | start time (e.g. 08:00) |
| availableTo | time | end time (e.g. 17:00) |
| isOff | boolean | true = day off |
| notes | text | optional (reason for time off) |
| createdAt | timestamp | |

**Constraints:**
- `(mechanicId, date)` unique

---

### 4.6 Job Code Generation

- Format: `J-000001`
- Sequence is per workspace (`companyId`)
- Generated server-side on creation
- Immutable after creation

---

## 5. Relationships

- Workspace 1 → N ScheduledJobs
- ManagementCompany 1 → N ScheduledJobs
- Building 1 → N ScheduledJobs
- Unit 1 → N ScheduledJobs
- Mechanic 1 → N ScheduledJobs
- ScheduledJob 1 → 0..1 Maintenance (linked post-completion)
- Mechanic 1 → N MechanicAvailability

---

## 6. Authorization

- **OWNER / ADMIN:**
  - Full CRUD on ScheduledJobs
  - Manage MechanicAvailability
  - Change job status
  - Assign/reassign mechanics

- **MEMBER:**
  - View all jobs
  - Update job status (for assigned jobs only)
  - Cannot create/delete jobs

---

## 7. UX / Routes

### 7.1 Schedule (Calendar View)

**Route:** `/app/schedule`

**Views:**
- **Day view**: Vertical timeline showing jobs by hour
- **Week view**: 7-day grid with jobs as blocks
- **Month view**: Calendar grid with job counts per day

**Features:**
- Filter by mechanic (dropdown)
- Filter by status (buttons: All, Scheduled, In Progress, Completed)
- Click job → detail panel or navigate to job page
- "Add job" button

---

### 7.2 Dispatch Dashboard

**Route:** `/app/dispatch`

**Sections:**
1. **Today's Jobs** — Jobs scheduled for today, grouped by status
2. **Unassigned Queue** — Jobs without a mechanic assigned
3. **Mechanic Workload** — List of mechanics with job count for today

**Quick Actions:**
- Assign mechanic to job (inline dropdown)
- Change job status (quick buttons)

---

### 7.3 Job List

**Route:** `/app/jobs`

**List View:**
- Job code, title, location (building/unit), mechanic, date, status, priority
- Filter: Status, Mechanic, Date range, Priority
- Sort: Date (default), Priority, Job code
- Archive filter (Active/Archived/All)

---

### 7.4 Job Detail

**Route:** `/app/jobs/[id]`

**Sections:**
1. **Job header**: Code, title, status badge, priority badge
2. **Assignment**: Mechanic (editable dropdown)
3. **Location**: Company → Building → Unit (read-only links)
4. **Schedule**: Date, start time, end time (editable)
5. **Status workflow**: Visual progress + action buttons
6. **Notes**: Editable text area
7. **Linked maintenance**: If completed, shows linked maintenance record

**Status Actions:**
- SCHEDULED → "Start Travel" (→ EN_ROUTE)
- EN_ROUTE → "Arrive On Site" (→ ON_SITE)
- ON_SITE → "Complete Job" (→ COMPLETED, prompts to create maintenance)
- Any → "Cancel Job" (→ CANCELLED)

---

### 7.5 Job Create/Edit

**Route:** `/app/jobs/new` and `/app/jobs/[id]/edit`

**Form Fields:**
1. Title (required)
2. Job Type (dropdown)
3. Priority (dropdown, default: NORMAL)
4. Management Company (dropdown, required)
5. Building (dropdown, filtered by company)
6. Unit (dropdown, filtered by building, optional)
7. Mechanic (dropdown, optional)
8. Scheduled Date (date picker, required)
9. Start Time (time picker, optional)
10. End Time (time picker, optional)
11. Description (textarea)

---

## 8. Status Workflow

```
┌──────────────┐
│  SCHEDULED   │ ← Initial state
└──────┬───────┘
       │ "Start Travel"
       ▼
┌──────────────┐
│   EN_ROUTE   │
└──────┬───────┘
       │ "Arrive On Site"
       ▼
┌──────────────┐
│   ON_SITE    │
└──────┬───────┘
       │ "Complete Job"
       ▼
┌──────────────┐
│  COMPLETED   │ → Creates Maintenance record
└──────────────┘

Any status → CANCELLED (with confirmation)
```

---

## 9. Job → Maintenance Linking

When a job is marked **COMPLETED**:

1. System prompts: "Create maintenance record for this job?"
2. If yes, auto-populate maintenance form:
   - Management Company (from job)
   - Building (from job)
   - Unit (from job)
   - Mechanic (from job)
   - Maintenance Date = job completion date
   - Notes = job description + job notes
3. Create maintenance record
4. Link `ScheduledJob.maintenanceId` → new maintenance ID

---

## 10. Server Logic Requirements

1. **Job code generation**: Atomic, transaction-safe
2. **Filtered selection integrity**:
   - Building must belong to ManagementCompany
   - Unit must belong to Building
3. **Status transitions**: Validate allowed transitions
4. **Tenant isolation**: All queries scoped by `companyId`
5. **Mechanic assignment**: Validate mechanic belongs to same workspace

---

## 11. Acceptance Criteria

Phase 9 is complete when:

1. ✅ User can create/edit/view scheduled jobs
2. ✅ Job codes are auto-generated (J-000001)
3. ✅ Jobs have status workflow (Scheduled → En Route → On Site → Completed)
4. ✅ Jobs can be assigned to mechanics
5. ✅ Calendar view shows jobs by day/week/month
6. ✅ Dispatch dashboard shows today's jobs and unassigned queue
7. ✅ Jobs list with filters (status, mechanic, date, priority)
8. ✅ Completing a job can create linked maintenance record
9. ✅ Jobs can be cancelled
10. ✅ MEMBER role can update status on assigned jobs only
11. ✅ All data is tenant-scoped

---

## 12. Deliverables

- Prisma migrations for:
  - ScheduledJob
  - JobStatus, JobPriority, JobType enums
  - MechanicAvailability (optional)
- Job CRUD UI
- Calendar view component
- Dispatch dashboard
- Job status workflow actions
- Job-to-Maintenance linking
- Navigation updates (add "Schedule", "Dispatch", "Jobs")
- README update

---

## 13. Navigation Changes

Add to main nav:
- **Schedule** → `/app/schedule` (calendar)
- **Dispatch** → `/app/dispatch` (dashboard)
- **Jobs** → `/app/jobs` (list)

Consider grouping:
```
Operations
├── Schedule (calendar)
├── Dispatch (dashboard)
├── Jobs (list)
└── Maintenance (existing)
```

---

## 14. UI Mockup Concepts

### Calendar (Week View)
```
┌─────────────────────────────────────────────────────────┐
│  ◀ Jan 27 - Feb 2, 2026 ▶    [Day] [Week] [Month]      │
├─────────────────────────────────────────────────────────┤
│ Time  │ Mon 27 │ Tue 28 │ Wed 29 │ Thu 30 │ Fri 31 │...│
├───────┼────────┼────────┼────────┼────────┼────────┼───┤
│ 8:00  │        │ ██████ │        │        │        │   │
│ 9:00  │ ██████ │ ██████ │        │ ██████ │        │   │
│ 10:00 │ ██████ │        │ ██████ │ ██████ │        │   │
│ 11:00 │        │        │ ██████ │        │ ██████ │   │
│ ...   │        │        │        │        │        │   │
└───────┴────────┴────────┴────────┴────────┴────────┴───┘
```

### Dispatch Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ DISPATCH                                    [+ Add Job] │
├─────────────────────────────────────────────────────────┤
│ TODAY'S JOBS (Jan 28)                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ● SCHEDULED (3)                                     │ │
│ │   J-000045 - Torre 1 PM - Pepe Forte - 9:00 AM     │ │
│ │   J-000046 - Edificio Sur Check - Unassigned       │ │
│ │   J-000047 - Main Building - Pepe Forte - 2:00 PM  │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ ● EN ROUTE (1)                                      │ │
│ │   J-000044 - Torre 1 Emergency - Pepe Forte        │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ UNASSIGNED QUEUE (2)                                    │
│   J-000046 - Edificio Sur Check - Jan 28  [Assign ▼]   │
│   J-000048 - Callback request - Jan 29    [Assign ▼]   │
├─────────────────────────────────────────────────────────┤
│ MECHANIC WORKLOAD                                       │
│   Pepe Forte ████████░░ 4 jobs today                   │
└─────────────────────────────────────────────────────────┘
```

---

## 15. Non-Goals (Phase 9)

- Mobile app / offline support
- Push notifications
- GPS tracking
- Route optimization
- Recurring jobs
- Time estimates
- Customer-facing portal
- Drag-and-drop scheduling

---

## 16. Future Considerations (Phase 10+)

- **Recurring jobs**: Templates for weekly/monthly PM schedules
- **Route optimization**: Minimize travel between jobs
- **Mobile PWA**: Field mechanic app
- **Notifications**: SMS/email reminders to mechanics
- **Customer portal**: Building managers view scheduled work
- **Time tracking**: Actual vs estimated job duration
- **Parts/inventory**: Link parts used to jobs

---

## End of PRD — Phase 9
