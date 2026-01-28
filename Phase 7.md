# LIFTER — Product Requirements Document (PRD)
## MVP Phase 7: Operational Intelligence & Compliance Awareness

---

## 1. Objective

Phase 7 transforms LIFTER from a **system of record** into a **system of action**.

The goal is to:
- Surface what matters *right now*
- Highlight compliance risks
- Provide operational visibility without adding new core entities

This phase focuses on:
- Dashboards
- Derived status logic
- Alerts & priority views

No new CRUD-heavy business tables are introduced in this phase.

---

## 2. In Scope (Phase 7)

### ✅ Included
1. Operational dashboard
2. Compliance-focused views (Inspections)
3. Derived statuses (calculated, not stored)
4. Priority alerts (in-app only)
5. Role-aware data visibility
6. Cross-entity aggregation (Units, Inspections, Maintenance, Emergency Calls)

### ❌ Explicitly Excluded
- Email/SMS notifications
- Background jobs / schedulers
- Preventive maintenance recurrence
- External integrations
- AI recommendations
- New core domain tables

---

## 3. Tech Stack (Unchanged)

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- Auth.js (NextAuth v5)
- PostgreSQL (Supabase)
- Prisma ORM

---

## 4. Key Principle (Very Important)

**Phase 7 introduces DERIVED INTELLIGENCE, not new stored state.**

All alerting and compliance statuses must be:
- Computed at query time
- Based on existing data
- Deterministic and reproducible

No cron jobs. No background workers.

---

## 5. Derived Logic Definitions

### 5.1 Inspection Compliance Status (Derived)

Based on:
- `inspection.expirationDate`
- Current date

Rules:
- **VALID**
  - expirationDate > today + 30 days
- **EXPIRING_SOON**
  - expirationDate ≤ today + 30 days AND ≥ today
- **OVERDUE**
  - expirationDate < today
- **MISSING**
  - Unit has no inspection records

> These values are NOT stored in DB; they are calculated.

---

### 5.2 Emergency Call Status (Derived)

Based on:
- `completedAt`

Rules:
- **OPEN**
  - completedAt IS NULL
- **CLOSED**
  - completedAt IS NOT NULL

---

### 5.3 Maintenance Activity Status (Derived)

Based on:
- `maintenanceDate`
- `status` (existing)

Rules:
- **RECENT**
  - maintenanceDate within last 7 days
- **STALE**
  - maintenanceDate older than 30 days
- **OPEN**
  - status = OPEN

---

## 6. New Pages / Routes

### 6.1 Main Dashboard

**Route**

**Purpose**
High-level operational overview.

**Widgets**
1. Inspection Overview
   - Expiring soon count
   - Overdue count
2. Emergency Calls
   - Open calls count
3. Maintenance Activity
   - Open maintenance count
4. Units at Risk
   - Units with overdue or missing inspections

Each widget must link to its detailed view.

---

### 6.2 Compliance View (Inspections)

**Route**

**Purpose**
Inspection-centric risk management.

**Sections**
- Overdue inspections
- Expiring in next 30 days
- Units missing inspections

Each row should show:
- Management Company
- Building
- Unit
- Last inspection date
- Expiration date
- Derived compliance status

---

### 6.3 Alerts View

**Route**

**Purpose**
Unified list of “things that need attention”.

**Alert Types**
- Inspection overdue
- Inspection expiring soon
- Emergency call open
- Maintenance open

Alerts are:
- Read-only
- Derived dynamically
- Not dismissible (Phase 7)

---

## 7. Data Access & Query Requirements

- All queries must:
  - Enforce tenant scoping (`companyId`)
  - Respect role access (OWNER/ADMIN/MEMBER)
- Aggregations must be done server-side
- No client-side heavy computation

---

## 8. Authorization

- OWNER / ADMIN:
  - Full access to all Phase 7 views
- MEMBER:
  - Read-only access (same views, no edits)

No new roles introduced.

---

## 9. UX Requirements

- Dashboard must load fast (avoid N+1 queries)
- Use clear visual hierarchy:
  - Red = Overdue
  - Yellow = Expiring Soon
  - Neutral = Informational
- Clicking an alert should navigate to the relevant detail page
- No modal-heavy flows in Phase 7

---

## 10. Server Logic Requirements

- Derived statuses must be:
  - Computed consistently across all views
  - Centralized (helper/util function or query logic)
- Avoid duplicating business rules across pages
- Ensure date comparisons use consistent timezone logic

---

## 11. Acceptance Criteria

Phase 7 is complete when:

1. Dashboard shows accurate aggregated counts
2. Compliance view correctly categorizes inspections
3. Units with no inspections are flagged
4. Emergency calls show open vs closed correctly
5. Alerts page aggregates all “action-needed” items
6. No new DB tables are created
7. MEMBER role remains read-only
8. Performance is acceptable with realistic data volumes

---

## 12. Deliverables

- Dashboard page
- Compliance page
- Alerts page
- Shared derived-status logic
- Updated navigation
- README update describing Phase 7 features

---

## 13. Non-Goals (Phase 7)

- Notifications
- Scheduling
- Persistence of alert state
- Background processing
- AI predictions
- Mobile-specific layouts

---

## End of PRD — Phase 7
