# Phase 8 PRD – Archive & Safe Delete

## Objective

Enable users to safely remove incorrect or obsolete data from LIFTER without breaking tenant data integrity by introducing **Archive / Restore** behavior and **guarded permanent deletes** for core entities.

This phase improves beta usability by allowing cleanup of mistakes while preserving operational history and preventing accidental destructive loss.

---

## Scope

### In Scope
- Archive / restore functionality for core entities
- Guarded permanent delete for records with **no downstream references**
- UI affordances (row actions, confirmation modals, disabled states)
- Default list filtering to hide archived records
- Tenant-safe, role-aware server actions

### Out of Scope
- Full audit trail (Phase 10)
- Advanced permissions matrix (Phase 9)
- Bulk archive/delete
- Background jobs / async cleanup
- Hard cascading deletes of operational history

---

## Deletion Model (Authoritative)

### Terminology
- **Archive** = soft delete (record hidden from default UI, reversible)
- **Permanent delete** = hard delete (irreversible, guarded)

### Entity Rules

#### Building
- **Archive allowed** (ADMIN, OWNER)
  - Cascades archive to all associated Units
- **Permanent delete allowed only if**
  - Building has **0 Units**
- If delete is disallowed, UI must explain why

#### Unit
- **Archive allowed** (ADMIN, OWNER)
- Archived Units:
  - Hidden from default lists
  - Cannot be selected in new Maintenance / Inspection / Emergency Call forms
- **Permanent delete allowed only if**
  - Unit has **0 Maintenance**
  - AND **0 Inspections**
  - AND **0 Emergency Calls**

#### Maintenance / Inspection / Emergency Call
- **Archive allowed** (ADMIN, OWNER)
- Permanent delete:
  - Not supported in Phase 8

#### Management Company
- **Archive allowed** (ADMIN, OWNER)
- **Permanent delete allowed only if**
  - No Buildings exist

#### Contact
- **Archive allowed**
- **Permanent delete allowed only if**
  - Not referenced anywhere

#### Mechanic / Inspector
- Use existing `isActive=false` for deactivation
- No hard delete in Phase 8

---

## Data Model Changes (Prisma)

### New Fields
Add `archivedAt DateTime?` to:
- `Building`
- `Unit`
- `ManagementCompany`
- `Contact`
- `Maintenance`
- `Inspection`
- `EmergencyCall`

### Notes
- Do **not** remove existing `isActive` fields
- No cascade rules at DB level
- Cascade behavior handled explicitly in server actions

### Indexing (Recommended)
- Composite index on `(companyId, archivedAt)` for list queries

---

## UI / UX

### List Views
- Default filter: **Active only** (`archivedAt IS NULL`)
- Filter toggle:
  - `Active`
  - `Archived`
  - `All`

### Row Actions (Kebab Menu)
- Active record:
  - Archive
- Archived record:
  - Restore
  - Delete permanently (if allowed)

### Confirmation Modals
All destructive actions require explicit confirmation.

Examples:
- **Archive Building**
  - “Archiving this building will also archive **12 units**. You can restore them later.”
- **Delete Unit (disabled)**
  - “This unit cannot be deleted because it has maintenance, inspections, or emergency calls.”

### Disabled Actions
- Delete buttons must be **disabled (not hidden)** when disallowed
- Tooltip or helper text must explain why

---

## Server Actions / API Logic

### General Rules (Non-Negotiable
