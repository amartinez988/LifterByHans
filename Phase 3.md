# LIFTER — Product Requirements Document (PRD)
## MVP Phase 3: Management Companies, Contacts & Contact Categories

---

## 1. Objective

Phase 3 introduces the first **real business-domain data** into LIFTER.

The goal is to allow authenticated users to:
- Create and manage **Management Companies**
- Create and manage **Contacts**
- Create and manage **Contact Categories**
- Seamlessly create missing related records inline (no dead ends)

This phase lays the foundation for **Buildings and Units** in future phases,
but those entities are **explicitly not implemented now**.

---

## 2. In Scope (Phase 3)

### ✅ Included
1. Management Company CRUD (Create, Read, Update, basic List)
2. Contact CRUD (scoped to workspace)
3. Contact Category CRUD (scoped to workspace)
4. Relationship:
   - Management Company → multiple Contacts
   - One Contact may be marked as Primary
5. Inline creation flows:
   - Create Contact while creating/editing Management Company
   - Create Contact Category while creating/editing Contact
6. Tenant scoping (workspace/companyId)

### ❌ Explicitly Excluded
- Buildings
- Units / Elevators
- Inspections / Maintenance
- Advanced search or filters
- Soft deletes
- Permissions beyond OWNER / ADMIN / MEMBER
- Audit logs

---

## 3. Tech Stack (Unchanged)

Same as Phases 1 & 2.

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- Auth.js (NextAuth v5)
- PostgreSQL (Supabase)
- Prisma ORM

---

## 4. Normalized Data Model (Phase 3)

All records MUST be scoped to a workspace via `companyId`.

---

### 4.1 ManagementCompany

Represents a property management company (future parent of Buildings).

**Table: `ManagementCompany`**

| Field | Type | Notes |
|-----|-----|------|
| id | uuid | Primary key |
| companyId | uuid | Workspace / tenant |
| name | string | Required |
| accountNumber | string | Optional, unique per workspace |
| website | string | Optional |
| mainPhone | string | Optional |
| emergencyPhone | string | Optional |
| notes | text | Optional |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**Constraints**
- `(companyId, name)` should be unique
- `(companyId, accountNumber)` unique if provided

---

### 4.2 ContactCategory

Used to classify contacts (Accounting, Property Manager, Inspector, etc.)

**Table: `ContactCategory`**

| Field | Type | Notes |
|-----|-----|------|
| id | uuid | Primary key |
| companyId | uuid | Workspace / tenant |
| name | string | Required |
| description | string | Optional |
| createdAt | timestamp | |

**Constraints**
- `(companyId, name)` must be unique

---

### 4.3 Contact

Contacts belong to a Management Company and a Contact Category.

**Table: `Contact`**

| Field | Type | Notes |
|-----|-----|------|
| id | uuid | Primary key |
| companyId | uuid | Workspace / tenant |
| managementCompanyId | uuid | FK → ManagementCompany |
| contactCategoryId | uuid | FK → ContactCategory |
| firstName | string | Required |
| lastName | string | Required |
| email | string | Optional |
| phone | string | Optional |
| isPrimary | boolean | Default false |
| notes | text | Optional |
| createdAt | timestamp | |

**Constraints**
- Only ONE contact per ManagementCompany may have `isPrimary = true`
- Email uniqueness is NOT enforced globally (real-world flexibility)

---

## 5. Relationships (Explicit)

- Workspace (Company)
  - 1 → N ManagementCompanies
  - 1 → N Contacts
  - 1 → N ContactCategories

- ManagementCompany
  - 1 → N Contacts

- Contact
  - N → 1 ContactCategory

---

## 6. UX / Navigation

### 6.1 Navigation Entry Points

Authenticated users must see:

- `/app/management-companies`
- `/app/contacts`
- `/app/contact-categories` (may be hidden behind Contacts UI)

---

## 7. UX Flows (Critical)

### 7.1 Management Company List

**Route**

**Features**
- List existing Management Companies
- “Add Management Company” button
- Click row → view/edit Management Company

---

### 7.2 Create / Edit Management Company

**Route**

**Form Sections**
1. Company Details
   - Name (required)
   - Account Number
   - Website
   - Phones
   - Notes

2. Contacts Section
   - List existing linked contacts
   - Primary contact indicator
   - Buttons:
     - “Add existing contact”
     - “Create new contact”

---

### 7.3 Inline Contact Creation (Required)

When user clicks **Create new contact**:

- Show modal or inline form
- Fields:
  - First Name
  - Last Name
  - Email
  - Phone
  - Contact Category (select)
  - Primary contact toggle

If desired Contact Category does NOT exist:
- Show **“Create new category”** option

---

### 7.4 Inline Contact Category Creation

When creating/editing a Contact:

- Dropdown of existing Contact Categories
- Option:
  - “+ Create new category”

Category form:
- Name (required)
- Description (optional)

On submit:
- Save category
- Auto-select it for the contact

---

## 8. Authorization Rules

- OWNER / ADMIN:
  - Full CRUD on all Phase 3 entities
- MEMBER:
  - Read-only access (MVP default)

---

## 9. Server Logic Requirements

- All create/update operations must be server-side
- Enforce tenant scoping (`companyId`) on every query
- Enforce single primary contact per Management Company
- Inline creation must be transactional where possible

---

## 10. Acceptance Criteria

Phase 3 is complete when:

1. User can create a Management Company
2. User can view/edit Management Companies
3. User can create Contacts
4. User can create Contact Categories
5. User can create Contacts inline while creating Management Company
6. User can create Contact Categories inline while creating Contacts
7. One primary contact per Management Company is enforced
8. All data is tenant-scoped
9. No dead-end forms exist

---

## 11. Deliverables

- Prisma migration for:
  - ManagementCompany
  - Contact
  - ContactCategory
- Management Company UI
- Contact UI
- Inline creation flows
- Updated navigation
- README updated with Phase 3 notes

---

## 12. Non-Goals (Phase 3)

- Buildings
- Units
- File uploads
- Advanced permissions
- Reporting
- External integrations

---

## End of PRD — Phase 3

