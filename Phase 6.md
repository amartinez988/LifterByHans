# LIFTER — Product Requirements Document (PRD)
## MVP Phase 6: Inspections + Emergency Calls (Missing Tables Implementation)

---

## 1. Objective

Phase 6 adds the remaining operational modules required by the master schema:
- **Inspections**
- **Emergency Calls**

This phase introduces:
- Normalized lookup tables for inspection & emergency statuses (and inspection results)
- An **Inspector** master table (like Mechanics)
- CRUD + filtered selection flows consistent with Maintenance (Phase 5)

This phase MUST follow established platform rules:
- Tenant scoping (`companyId`) everywhere
- OWNER/ADMIN full CRUD; MEMBER read-only
- Filtered selection integrity:
  Management Company → Buildings → Units

(Background: Phase 5 explicitly excluded Inspections and Emergency Calls; Phase 6 implements them.) :contentReference[oaicite:2]{index=2}

---

## 2. In Scope (Phase 6)

### ✅ Included
1. Inspector CRUD
2. Inspection CRUD
3. Inspection lookup tables:
   - InspectionStatus
   - InspectionResult
4. Emergency Call CRUD
5. Emergency Call lookup table:
   - EmergencyCallStatus
6. Inline creation in forms:
   - Create missing Inspector inline from Inspection form
   - Create missing InspectionStatus/InspectionResult inline from Inspection form
   - Create missing EmergencyCallStatus inline from Emergency Call form
7. Filtered selection flow:
   - Select Management Company → filter Buildings
   - Select Building → filter Units

### ❌ Explicitly Excluded
- Notifications/reminders (email/SMS)
- File uploads (store URL string only)
- Scheduling engine / recurrence
- Mobile app views
- Advanced reporting dashboards

---

## 3. Tech Stack (Unchanged)

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- Auth.js (NextAuth v5)
- PostgreSQL (Supabase)
- Prisma ORM

---

## 4. Data Model (Normalized + Tenant Scoped)

All tables MUST include `companyId` and enforce tenant scoping in every query/write.

### 4.1 Inspector (NEW)

Represents an external inspector (regulatory/3rd-party) who performs inspections. The PDF includes inspector name/phone/email/company. :contentReference[oaicite:3]{index=3}

**Table: `Inspector`**
| Field | Type | Notes |
|------|------|------|
| id | uuid | PK |
| companyId | uuid | tenant/workspace |
| firstName | string | required |
| lastName | string | required |
| companyName | string | optional |
| email | string | optional |
| phone | string | optional |
| isActive | boolean | default true |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**Constraints**
- `(companyId, email)` unique if email provided (optional constraint)

---

### 4.2 InspectionStatus (NEW lookup)

The PDF lists example statuses: “Up to Date / Expiring Soon / Scheduled / Pending”. :contentReference[oaicite:4]{index=4}

**Table: `InspectionStatus`**
| Field | Type | Notes |
|------|------|------|
| id | uuid | PK |
| companyId | uuid | tenant |
| name | string | required |
| description | string | optional |
| createdAt | timestamp | |

**Constraints**
- `(companyId, name)` unique

---

### 4.3 InspectionResult (NEW lookup)

The PDF lists results like “Passed / Failed”. :contentReference[oaicite:5]{index=5}

**Table: `InspectionResult`**
| Field | Type | Notes |
|------|------|------|
| id | uuid | PK |
| companyId | uuid | tenant |
| name | string | required |
| description | string | optional |
| createdAt | timestamp | |

**Constraints**
- `(companyId, name)` unique

---

### 4.4 Inspection (NEW)

Links an inspection record to the Unit, Building, Management Company.
The PDF defines: building, unit, inspector details, status, inspection date, expiration date, result, report link. :contentReference[oaicite:6]{index=6}

**Table: `Inspection`**
| Field | Type | Notes |
|------|------|------|
| id | uuid | PK |
| companyId | uuid | tenant |
| inspectionCode | string | user-facing (e.g. I-000001) |
| managementCompanyId | uuid | FK → ManagementCompany |
| buildingId | uuid | FK → Building |
| unitId | uuid | FK → Unit |
| inspectorId | uuid | FK → Inspector (optional but recommended) |
| inspectionStatusId | uuid | FK → InspectionStatus (required) |
| inspectionResultId | uuid | FK → InspectionResult (optional) |
| inspectionDate | date | required |
| expirationDate | date | optional |
| reportUrl | string | optional (URL/string only) |
| notes | text | optional |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**Constraints**
- `(companyId, inspectionCode)` unique

---

### 4.5 EmergencyCallStatus (NEW lookup)

The PDF lists statuses like:
“Scheduled / Accepted / Working on it / Completed / Paused”. :contentReference[oaicite:7]{index=7}

**Table: `EmergencyCallStatus`**
| Field | Type | Notes |
|------|------|------|
| id | uuid | PK |
| companyId | uuid | tenant |
| name | string | required |
| description | string | optional |
| createdAt | timestamp | |

**Constraints**
- `(companyId, name)` unique

---

### 4.6 EmergencyCall (NEW)

The PDF defines: ticket number, building, unit, mechanic, call-in datetime, issue description, status, completion date. :contentReference[oaicite:8]{index=8}

**Table: `EmergencyCall`**
| Field | Type | Notes |
|------|------|------|
| id | uuid | PK |
| companyId | uuid | tenant |
| emergencyCode | string | user-facing (e.g. E-000001) |
| ticketNumber | string | optional (external reference) |
| managementCompanyId | uuid | FK → ManagementCompany |
| buildingId | uuid | FK → Building |
| unitId | uuid | FK → Unit |
| mechanicId | uuid | FK → Mechanic (optional) |
| emergencyCallStatusId | uuid | FK → EmergencyCallStatus (required) |
| callInAt | datetime | required |
| completedAt | datetime | optional |
| issueDescription | text | required |
| notes | text | optional |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**Constraints**
- `(companyId, emergencyCode)` unique

---

## 5. Code Generation (Required)

Implement code generation similar to Maintenance:
- Inspection: `I-000001`
- Emergency call: `E-000001`
- Per-tenant sequence (scoped to `companyId`)
- Generated server-side, atomic/transaction-safe
- Immutable after creation

---

## 6. UX / Routes (Required)

### 6.1 Inspections
- List:
  - `/app/inspections`
- Create:
  - `/app/inspections/new`
- Detail/Edit:
  - `/app/inspections/[id]`

### 6.2 Emergency Calls
- List:
  - `/app/emergency-calls`
- Create:
  - `/app/emergency-calls/new`
- Detail/Edit:
  - `/app/emergency-calls/[id]`

### 6.3 Inspector Management
- List:
  - `/app/inspectors`
- Create/Edit:
  - `/app/inspectors/new`
  - `/app/inspectors/[id]`

---

## 7. Critical Form Flows (Must Match Existing Patterns)

### 7.1 Inspection Creation Flow
Step 1: Select Management Company (required)
Step 2: Select Building (filtered by selected Management Company)
Step 3: Select Unit (filtered by selected Building)
Step 4: Inspection Details
- Inspection Date (required)
- Status (required; dropdown from InspectionStatus)
- Result (optional; dropdown from InspectionResult)
- Inspector (optional; dropdown from Inspector)
- Expiration Date (optional)
- Report URL (optional)
- Notes (optional)

Inline creation (mandatory):
- In Status dropdown: “+ Create new status”
- In Result dropdown: “+ Create new result”
- In Inspector dropdown: “+ Create new inspector”

On submit:
- Generate inspectionCode
- Persist record
- Redirect to inspection detail page

---

### 7.2 Emergency Call Creation Flow
Step 1: Select Management Company (required)
Step 2: Select Building (filtered)
Step 3: Select Unit (filtered)
Step 4: Emergency Details
- Call-in time `callInAt` (required datetime)
- Status (required; dropdown from EmergencyCallStatus)
- Ticket Number (optional)
- Mechanic (optional; dropdown from Mechanic)
- Issue Description (required)
- CompletedAt (optional)
- Notes (optional)

Inline creation (mandatory):
- In Status dropdown: “+ Create new status”
(Do NOT allow inline creation of Mechanics in this phase; Mechanics already exist from Phase 5.)

On submit:
- Generate emergencyCode
- Persist record
- Redirect to emergency call detail page

---

## 8. Authorization

- OWNER / ADMIN: full CRUD for all Phase 6 entities
- MEMBER: read-only

---

## 9. Server Logic Requirements

- All CRUD operations must be server-side (Route Handlers or Server Actions).
- Enforce tenant scoping (`companyId`) in all queries/writes.
- Enforce relationship integrity:
  - buildingId must belong to managementCompanyId
  - unitId must belong to buildingId
- Prevent cross-tenant access.
- Code generation (I-/E-) must be atomic/transaction-safe.

---

## 10. Acceptance Criteria

Phase 6 is complete when:

1. User can create/edit Inspectors
2. User can create InspectionStatus and InspectionResult entries (including inline)
3. User can create Inspections using filtered dropdown flow
4. Inspection codes are generated and visible
5. User can create EmergencyCallStatus entries (including inline)
6. User can create Emergency Calls using filtered dropdown flow
7. Emergency codes are generated and visible
8. Invalid cross-relations cannot be saved (filtered integrity enforced server-side)
9. MEMBER role is read-only across Phase 6 pages
10. Lists and detail pages reflect DB state without errors

---

## 11. Deliverables

- Prisma migrations for:
  - Inspector
  - Inspection
  - InspectionStatus
  - InspectionResult
  - EmergencyCall
  - EmergencyCallStatus
- UI pages/routes listed above
- Inline lookup creation modals
- Server-side code generators for Inspection and Emergency Call
- README update documenting Phase 6 routes and setup

---

## 12. Non-Goals (Phase 6)

- Notifications/reminders
- Scheduling/recurrence
- Attachments/file uploads (URLs only)
- Reporting dashboards
- Mechanic mobile workflow

---

## End of PRD — Phase 6
