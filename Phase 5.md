# LIFTER — Product Requirements Document (PRD)
## MVP Phase 5: Mechanics & Maintenance

---

## 1. Objective

Phase 5 introduces **operational activity** into LIFTER.

The goal is to allow users to:
- Manage Mechanics (technicians)
- Record Maintenance events
- Assign Maintenance to Units, Buildings, and Management Companies
- Use filtered selections to prevent invalid data entry
- Use human-readable Maintenance IDs

This phase establishes the foundation for future modules:
- Inspections
- Emergency Calls
- Scheduling
- Compliance tracking

---

## 2. In Scope (Phase 5)

### ✅ Included
1. Mechanic CRUD
2. Maintenance CRUD (basic)
3. Maintenance assignment to:
   - Management Company
   - Building
   - Unit
   - Mechanic
4. Filtered selection logic:
   - Management Company → Buildings
   - Building → Units
5. Auto-generated Maintenance ID (user-facing)

### ❌ Explicitly Excluded
- Inspections
- Emergency Calls
- Recurring maintenance
- File uploads
- Mechanic login/auth
- Scheduling & reminders

---

## 3. Tech Stack (Unchanged)

Same as previous phases.

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- Auth.js (NextAuth v5)
- PostgreSQL (Supabase)
- Prisma ORM

---

## 4. Data Model (Normalized & Tenant Scoped)

All tables MUST include `companyId`.

---

### 4.1 Mechanic

Represents a technician.

**Table: `Mechanic`**

| Field | Type | Notes |
|-----|-----|------|
| id | uuid | PK |
| companyId | uuid | workspace |
| firstName | string | required |
| lastName | string | required |
| email | string | optional |
| phone | string | optional |
| level | string | optional (e.g. Senior, Junior) |
| isActive | boolean | default true |
| createdAt | timestamp | |

**Constraints**
- `(companyId, email)` unique if email is provided

---

### 4.2 Maintenance

Represents a single maintenance event.

**Table: `Maintenance`**

| Field | Type | Notes |
|-----|-----|------|
| id | uuid | PK |
| companyId | uuid | workspace |
| maintenanceCode | string | user-facing (e.g. M-000123) |
| managementCompanyId | uuid | FK → ManagementCompany |
| buildingId | uuid | FK → Building |
| unitId | uuid | FK → Unit |
| mechanicId | uuid | FK → Mechanic (optional) |
| status | string | e.g. OPEN, COMPLETED |
| maintenanceDate | date | required |
| notes | text | optional |
| createdAt | timestamp | |

**Constraints**
- `(companyId, maintenanceCode)` unique

---

### 4.3 Maintenance Code Generation (Required)

- Format: `M-000001`
- Sequence is per workspace (`companyId`)
- Generated server-side on creation
- Must be immutable after creation

---

## 5. Relationships (Explicit)

- Workspace 1 → N Mechanics
- Workspace 1 → N Maintenance
- ManagementCompany 1 → N Maintenance
- Building 1 → N Maintenance
- Unit 1 → N Maintenance
- Mechanic 1 → N Maintenance (optional)

---

## 6. Authorization

- OWNER / ADMIN:
  - Full CRUD on Mechanics & Maintenance
- MEMBER:
  - Read-only access

---

## 7. UX / Routes

### 7.1 Mechanics

**List**

- List mechanics
- “Add mechanic” button

**Create/Edit**

---

### 7.2 Maintenance

**List**

---

## 8. Maintenance Creation Flow (Critical)

### Step 1: Select Management Company
- Dropdown
- Required

### Step 2: Select Building
- Dropdown
- Filtered by selected Management Company

### Step 3: Select Unit
- Dropdown
- Filtered by selected Building

### Step 4: Maintenance Details
- Maintenance Date (required)
- Status (default: OPEN)
- Mechanic (optional)
- Notes

On submit:
- Generate maintenanceCode
- Persist record
- Redirect to maintenance detail page

---

## 9. Server Logic Requirements

- All creation/update must be server-side
- Enforce filtered selection integrity:
  - Building must belong to Management Company
  - Unit must belong to Building
- Prevent cross-tenant access
- Maintenance code generation must be atomic (transaction-safe)

---

## 10. Acceptance Criteria

Phase 5 is complete when:

1. User can create/edit Mechanics
2. User can view Mechanics list
3. User can create Maintenance
4. Maintenance uses filtered dropdowns correctly
5. MaintenanceCode is generated automatically
6. MaintenanceCode is visible to users
7. Invalid relationships cannot be saved
8. MEMBER role is read-only
9. Lists and detail pages reflect DB state

---

## 11. Deliverables

- Prisma migrations for:
  - Mechanic
  - Maintenance
- Mechanics UI
- Maintenance UI
- Filtered selection logic
- Maintenance code generator
- README update

---

## 12. Non-Goals (Phase 5)

- Inspections
- Emergency Calls
- Scheduling
- Notifications
- Reporting
- Attachments

---

## End of PRD — Phase 5

---

## 8. Maintenance Creation Flow (Critical)

### Step 1: Select Management Company
- Dropdown
- Required

### Step 2: Select Building
- Dropdown
- Filtered by selected Management Company

### Step 3: Select Unit
- Dropdown
- Filtered by selected Building

### Step 4: Maintenance Details
- Maintenance Date (required)
- Status (default: OPEN)
- Mechanic (optional)
- Notes

On submit:
- Generate maintenanceCode
- Persist record
- Redirect to maintenance detail page

---

## 9. Server Logic Requirements

- All creation/update must be server-side
- Enforce filtered selection integrity:
  - Building must belong to Management Company
  - Unit must belong to Building
- Prevent cross-tenant access
- Maintenance code generation must be atomic (transaction-safe)

---

## 10. Acceptance Criteria

Phase 5 is complete when:

1. User can create/edit Mechanics
2. User can view Mechanics list
3. User can create Maintenance
4. Maintenance uses filtered dropdowns correctly
5. MaintenanceCode is generated automatically
6. MaintenanceCode is visible to users
7. Invalid relationships cannot be saved
8. MEMBER role is read-only
9. Lists and detail pages reflect DB state

---

## 11. Deliverables

- Prisma migrations for:
  - Mechanic
  - Maintenance
- Mechanics UI
- Maintenance UI
- Filtered selection logic
- Maintenance code generator
- README update

---

## 12. Non-Goals (Phase 5)

- Inspections
- Emergency Calls
- Scheduling
- Notifications
- Reporting
- Attachments

---

## End of PRD — Phase 5
