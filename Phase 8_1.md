# Phase 8.1 PRD – Standardized Edit Page Actions & Destructive UX

## Objective

Standardize how **Save, Archive, Restore, and Delete** actions are presented across **all edit/create screens** in LIFTER, eliminating inconsistent “floating Actions” sections and replacing them with a **clear, professional, and predictable UI pattern**.

This phase ensures destructive actions are:
- Easy to find
- Consistent across modules
- Clearly separated from primary form actions
- Safe and role-guarded

This PRD applies to **every edit/detail form** in the authenticated app.

---

## Core UX Decision (Authoritative)

### ✅ Standard Pattern: Page Header Actions with Overflow Menu

All edit/detail pages must use a **Page Header** that contains:
- Page title (entity name or identifier)
- Contextual metadata (optional)
- Primary action(s): Save
- Secondary/destructive actions: in an **overflow (⋯) menu**

The existing “Actions” floating or bottom card **must be removed**.

---

## Applies To (Non-Exhaustive)

This pattern must be used for all entity forms, including:

- Buildings
- Units
- Management Companies
- Contacts
- Mechanics
- Inspectors
- Maintenance
- Inspections
- Emergency Calls
- Status / Category / Lookup editors

If a screen allows editing an entity, it must follow this pattern.

---

## Page Layout Specification

### Page Header (Required)

Positioned at the **top of the page**, above the form.

**Left side**
- Primary title:
  - e.g. `Inspection #IN-00123`
  - or `Edit Unit – Elevator A`
- Optional subtitle:
  - Building name
  - Status badge
  - Archived badge (if applicable)

**Right side**
- Primary button: **Save**
- Secondary: **Overflow menu (⋯)**

---

## Overflow Menu (⋯)

### Menu Items (Contextual)

Depending on entity state and permissions:

#### Active Record
- Archive (destructive, red text)

#### Archived Record
- Restore
- Delete permanently (destructive, red text, only if allowed)

### Disabled States
- If delete is not allowed:
  - Show item disabled
  - Tooltip or helper text explaining why
    - e.g. “Cannot delete: record has inspections”

### Permissions
- MEMBER: overflow menu hidden or disabled
- ADMIN:
  - Archive / Restore allowed
  - Permanent delete only where explicitly permitted
- OWNER:
  - Full access

---

## Confirmation Modals (Required)

All destructive actions require confirmation.

### Archive Modal
- Title: `Archive <Entity>`
- Message:
  - Explain impact clearly
  - Example:
    > “Archiving this building will also archive 12 associated units.  
    > You can restore them later.”
- Actions:
  - Cancel
  - Confirm Archive (destructive)

### Restore Modal
- Simple confirmation
- No destructive styling

### Permanent Delete Modal
- Strong warning language
- Explicit irreversible message
- Require user confirmation
- Example:
  > “This action cannot be undone.  
  > This unit will be permanently deleted.”

---

## Archived State UX

### Visual Indicators
- Show **Archived badge** near page title
- Disable form inputs (read-only mode)
- Replace Save with:
  - “Restore” button OR
  - Restore in overflow menu

### Behavior
- Archived records:
  - Are hidden from default lists
  - Cannot be selected in new forms
  - Can still be viewed in detail pages

---

## Form Footer (Explicit Rule)

### ❌ Do NOT place destructive actions:
- Inside the form body
- In a floating card
- In a randomly positioned “Actions” section

### ✅ Allowed in footer:
- Save
- Cancel / Back

Destructive actions **must live only in the page header overflow menu**.

---

## Component Guidelines

### New Shared Component (Recommended)
Create a reusable component, e.g.:

- `PageHeader`
  - Props:
    - title
    - subtitle
    - isArchived
    - primaryAction
    - overflowActions[]

This ensures consistency across modules and reduces duplication.

---

## Server-Side Requirements

- All archive/restore/delete actions:
  - Must be server actions or API routes
  - Must enforce:
    - Authentication
    - Role
    - Tenant isolation
- UI must not rely on client-only checks

---

## Acceptance Criteria

- No edit screen contains a floating or bottom “Actions” card
- All destructive actions are accessed via page header overflow menu
- Archive / Restore / Delete behavior is consistent across entities
- Archived records display clear visual state
- MEMBER users cannot see destructive actions
- ADMIN / OWNER permissions enforced correctly
- UX is identical across modules

---

## QA Checklist

### UX Consistency
- [ ] Header actions present on all edit pages
- [ ] Overflow menu placement consistent
- [ ] No mid-form or bottom destructive buttons

### Behavior
- [ ] Archive triggers confirmation modal
- [ ] Restore works correctly
- [ ] Delete disabled when dependencies exist

### Permissions
- [ ] MEMBER cannot archive/delete
- [ ] ADMIN limited appropriately
- [ ] OWNER has full access

### Regression
- [ ] Forms still submit correctly
- [ ] Save behavior unchanged
- [ ] No layout shift on mobile

---

## Implementation Order (Recommended)

1. Create shared PageHeader component
2. Update one core module (e.g. Inspections) as reference
3. Apply pattern to remaining modules
4. Remove old Actions cards
5. Manual regression testing
6. Commit → push → deploy

---

## Deployment Notes

- No DB changes required
- Safe to deploy incrementally per module
- Prefer Preview deploy for first module
- Verify on mobile and desktop

---

## Success Metric

A beta user can:
- Immediately find Save
- Clearly understand how to Archive or Restore
- Never feel destructive actions are “hidden” or “random”
- Trust the system with real operational data
