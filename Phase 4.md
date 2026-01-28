# LIFTER — Product Requirements Document (PRD)
## MVP Phase 4: Buildings + Units + Unit Lookups

---

## 1. Objective

Phase 4 adds core operational data:
- Buildings (scoped under a Management Company)
- Units (scoped under a Building)
- Unit lookup tables (Category, Status, Equipment Type, Brand)

Primary workflow:
1) Open a Management Company
2) Add/view Buildings under that Management Company
3) Open a Building
4) Add/view Units under that Building
5) While creating a Unit, users can create missing lookup values inline (like Contact Category in Phase 3)

Buildings and Units will be the foundation for future phases:
- Buildings belong to Management Companies (this phase)
- Units belong to Buildings (this phase)
- Inspections/Maintenance/etc will link to Units (future phases, NOT now)

---

## 2. In Scope (Phase 4)

### ✅ Included
1. Building CRUD (Create, Read, Update, List)
2. Unit CRUD (Create, Read, Update, List)
3. Lookup tables CRUD:
   - UnitCategory
   - UnitStatus
   - UnitEquipmentType
   - UnitBrand
4. Inline creation for lookups when creating/editing a Unit
5. Navigation:
   - Management Company detail shows Buildings list + Add Building
   - Building detail shows Units list + Add Unit
6. Tenant scoping (`companyId`) on all entities and queries

### ❌ Explicitly Excluded
- File uploads (certificates/photos as real attachments)
- Buildings-to-Contacts relationships (can be added later if needed)
- Mechanic assignment and mechanic tables usage in Unit (future phase)
- Advanced search, filters, sorting beyond basic list
- Audit logs, soft delete, import tools

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

All records MUST be scoped to the workspace via `companyId`.

---

### 4.1 Building

**Table: `Building`**

| Field | Type | Notes |
|------|------|------|
| id | uuid | PK |
| companyId | uuid | tenant/workspace |
| managementCompanyId | uuid | FK → ManagementCompany |
| name | string | required |
| address | string | required (MVP: single text field) |
| localPhone | string | optional |
| jurisdiction | string | optional |
| notes | text | optional |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**Constraints**
- `(companyId, managementCompanyId, name)` unique

---

### 4.2 Unit

**Table: `Unit`**

| Field | Type | Notes |
|------|------|------|
| id | uuid | PK |
| companyId | uuid | tenant/workspace |
| buildingId | uuid | FK → Building |
| identifier | string | required (unit name/identifier) |
| description | text | optional |
| serialNumber | string | optional |
| unitCategoryId | uuid | FK → UnitCategory (required) |
| unitStatusId | uuid | FK → UnitStatus (required) |
| equipmentTypeId | uuid | FK → UnitEquipmentType (required) |
| brandId | uuid | FK → UnitBrand (required) |
| underContract | boolean | default false |
| agreementStartDate | date | optional |
| agreementEndDate | date | optional |
| phoneLineService | boolean | default false |
| folderUrl | string | optional |
| landings | int | optional |
| capacity | int | optional |
| floorLocation | int | optional |
| machineRoomLocation | string | optional |
| buildingNumber | string | optional |
| certificateUrl | string | optional (MVP: store URL/string only) |
| photoUrl | string | optional (MVP: store URL/string only) |
| notes | text | optional |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**Constraints**
- `(companyId, buildingId, identifier)` unique

---

### 4.3 Lookup Tables (MVP)

Each lookup is tenant-scoped and must support adding entries.

#### UnitCategory
- id (uuid)
- companyId (uuid)
- name (string, required)
- description (string optional)
- createdAt

Unique: `(companyId, name)`

#### UnitStatus
- id (uuid)
- companyId (uuid)
- name (string, required)
- description (string optional)
- createdAt

Unique: `(companyId, name)`

#### UnitEquipmentType
- id (uuid)
- companyId (uuid)
- name (string, required)
- description (string optional)
- createdAt

Unique: `(companyId, name)`

#### UnitBrand
- id (uuid)
- companyId (uuid)
- name (string, required)
- description (string optional)
- createdAt

Unique: `(companyId, name)`

---

## 5. Relationships (Explicit)

- ManagementCompany 1 → N Building
- Building 1 → N Unit
- Unit N → 1 UnitCategory
- Unit N → 1 UnitStatus
- Unit N → 1 UnitEquipmentType
- Unit N → 1 UnitBrand

All scoped to workspace:
- Workspace 1 → N Buildings
- Workspace 1 → N Units
- Workspace 1 → N lookups

---

## 6. Authorization (same pattern as Phase 3)

Default MVP rules:
- OWNER / ADMIN: full CRUD for Phase 4 entities
- MEMBER: read-only

(If current app doesn’t enforce read-only for MEMBER yet, implement it now for these new pages at minimum.)

---

## 7. UX / Routes (Required)

### 7.1 Management Company Detail Page Enhancement
Existing route:
- `/app/management-companies/[id]`

Add section:
- **Buildings**
  - list buildings under this Management Company
  - button: “Add Building”
  - each building row links to building detail

Add Building action routes:
- `/app/management-companies/[id]/buildings/new`

---

### 7.2 Building Detail
Route:
- `/app/buildings/[id]`

Contents:
- Building summary (name, address, phone, jurisdiction)
- **Units list** under this building
- button: “Add Unit”
- unit rows link to unit detail page

Add Unit route:
- `/app/buildings/[id]/units/new`

---

### 7.3 Unit Detail / Edit
Route:
- `/app/units/[id]`

Contents:
- Unit fields (as in model)
- Edit and Save

---

## 8. Forms & Inline Creation Requirements (Critical)

### 8.1 Create Building Form
Fields:
- name (required)
- address (required)
- localPhone (optional)
- jurisdiction (optional)
- notes (optional)

Must auto-link:
- managementCompanyId (from route context)
- companyId (tenant)

---

### 8.2 Create Unit Form
Fields (required):
- identifier
- unitCategory (select)
- unitStatus (select)
- equipmentType (select)
- brand (select)

Fields (optional):
- description, serialNumber, underContract, agreement dates, phoneLineService,
  folderUrl, landings, capacity, floorLocation, machineRoomLocation, buildingNumber,
  certificateUrl, photoUrl, notes

Must auto-link:
- buildingId (from route context)
- companyId (tenant)

---

### 8.3 Inline Create Lookup Entries
Whenever a Unit form has a lookup dropdown (Category/Status/EquipmentType/Brand):

- Provide “+ Create new …” option
- Clicking it opens a small modal (or inline form) to add:
  - name (required)
  - description (optional)
- On save:
  - create lookup record
  - auto-select it in the Unit form

This is mandatory for:
- UnitCategory
- UnitStatus
- UnitEquipmentType
- UnitBrand

---

## 9. Server Logic Requirements

- All CRUD must be server-side (Route Handlers or Server Actions)
- Enforce tenant scoping (`companyId`) in all queries and writes
- Enforce ownership: user must be a member of the workspace company
- Enforce relationship integrity:
  - Building being created must belong to the ManagementCompany in the route
  - Unit being created must belong to the Building in the route
  - Cross-tenant access must be impossible

---

## 10. Acceptance Criteria

Phase 4 is complete when:

1. User can open a Management Company and see Buildings section
2. User can create a Building under a Management Company
3. User can open a Building and see Units list
4. User can create a Unit under a Building
5. Unit creation requires Category/Status/EquipmentType/Brand
6. User can create missing lookup values inline from Unit form
7. All data is tenant-scoped and access controlled
8. MEMBER role cannot create/update/delete (read-only at minimum for Phase 4 entities)
9. Lists and detail pages render without errors and reflect DB state

---

## 11. Deliverables

- Prisma migrations for:
  - Building
  - Unit
  - UnitCategory
  - UnitStatus
  - UnitEquipmentType
  - UnitBrand
- UI routes/pages listed above
- Inline lookup creation modals/forms
- Updated Management Company detail page with Buildings section
- README update for Phase 4 setup and routes

---

## 12. Non-Goals (Phase 4)

- File attachment uploads (store URLs only in MVP)
- Mechanic assignment
- Inspections/Maintenance/Emergency Calls
- Complex filtering/search/reporting

---

## End of PRD — Phase 4
