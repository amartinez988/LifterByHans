# LIFTER — PRD Amendment
## Phase 5.1: Mechanic Level Lookup Table

---

## Objective

Correct the Phase 5 Mechanic implementation to replace the free-text
`level` field with a normalized lookup table `MechanicLevel`, following
the same pattern used for ContactCategory and UnitCategory.

---

## In Scope

1. Add `MechanicLevel` lookup table
2. Update `Mechanic` to reference `MechanicLevel`
3. Update Mechanic create/edit UI
4. Allow inline creation of Mechanic Levels

---

## Data Model Changes

### New Table: `MechanicLevel`

**Table: `MechanicLevel`**

| Field | Type | Notes |
|-----|-----|------|
| id | uuid | PK |
| companyId | uuid | workspace / tenant |
| name | string | required |
| description | string | optional |
| createdAt | timestamp | |

**Constraints**
- `(companyId, name)` must be unique

---

### Update Table: `Mechanic`

**Changes**
- Remove `level` (string)
- Add `mechanicLevelId` (uuid, FK → MechanicLevel)

Updated fields:

| Field | Type |
|-----|-----|
| mechanicLevelId | uuid (required) |

---

## UX Changes

### Mechanic Create / Edit Form

Replace:
- Free-text “Level” input

With:
- Dropdown: **Mechanic Level**
- Options loaded from `MechanicLevel`
- Include option: **“+ Create new level”**

---

## Inline Mechanic Level Creation (Required)

When user selects “+ Create new level”:
- Show modal or inline form
- Fields:
  - Name (required)
  - Description (optional)
- On save:
  - Create `MechanicLevel`
  - Auto-select it for the Mechanic

---

## Authorization

- OWNER / ADMIN: full CRUD
- MEMBER: read-only

---

## Migration Requirements

- Create Prisma migration to:
  - Add `MechanicLevel`
  - Update `Mechanic`
- Existing Mechanics:
  - May have `mechanicLevelId` nullable initially
  - Agents may backfill or require re-selection in UI

---

## Acceptance Criteria

1. Mechanic Level is no longer free text
2. Mechanic Level is selected from dropdown
3. User can create a new level inline
4. Mechanic saves successfully with linked level
5. Tenant scoping is enforced

---

## End of Phase 5.1 Amendment
