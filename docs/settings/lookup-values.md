# Lookup Values

Lookup values are the configurable dropdown options used throughout Uplio. They let you customize the system to match your business terminology and workflow. Setting up lookup values before adding data ensures consistency across your workspace.

---

## What Are Lookup Values?

Lookup values are predefined options for dropdown fields. Instead of typing free-text, users select from your configured options. This ensures:

- **Consistency** — Everyone uses the same terms
- **Accuracy** — No typos or variations
- **Reporting** — Easy to filter and analyze
- **Professionalism** — Clean, standardized data

---

## Types of Lookup Values

### Unit-Related Lookups

| Lookup Type | Used For | Examples |
|-------------|----------|----------|
| **Unit Categories** | Type of equipment | Passenger, Freight, Escalator, Dumbwaiter |
| **Unit Statuses** | Operational state | Operational, Out of Service, Under Repair |
| **Equipment Types** | Technical classification | Traction, Hydraulic, MRL |
| **Brands** | Manufacturer | Otis, KONE, Schindler, ThyssenKrupp |

### People-Related Lookups

| Lookup Type | Used For | Examples |
|-------------|----------|----------|
| **Contact Categories** | Contact roles | Property Manager, Superintendent, Accounting |
| **Mechanic Levels** | Skill levels | Junior, Senior, Lead Technician |

### Operations-Related Lookups

| Lookup Type | Used For | Examples |
|-------------|----------|----------|
| **Inspection Statuses** | Inspection state | Scheduled, Completed, Pending Report |
| **Inspection Results** | Inspection outcome | Passed, Failed, Conditional |
| **Emergency Statuses** | Emergency state | Received, Dispatched, Resolved |

---

## Where to Configure Lookup Values

### Inline Creation

When creating or editing records, you can add new lookup values on the fly:

1. Find the dropdown field (e.g., Category)
2. Click **"+ Create new [type]"** below the dropdown
3. Enter the name and optional description
4. Click **"Create"**
5. The new value is automatically selected

![Inline lookup creation](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/lookup-inline-creation.png)

### Contact Categories Page

For contact categories specifically:

1. Click **"Categories"** under People in the sidebar
2. View, create, edit, or delete categories

---

## Creating Lookup Values

### Inline Method

1. Go to any form with a lookup dropdown
2. Click the **"+ Create new..."** link
3. Fill in:
   - **Name** — The display value (required)
   - **Description** — Optional explanation
4. Click **"Create [type]"**

### From Categories Page (Contacts)

1. Navigate to **People** > **Categories**
2. Click **"Add category"**
3. Enter name and description
4. Click **"Create category"**

---

## Editing Lookup Values

### To Edit

1. Navigate to the lookup management area
2. Click on the value to edit
3. Update the name or description
4. Save changes

> ⚠️ **Note:** Changing a lookup name updates how it displays everywhere, but existing records remain linked.

---

## Deleting Lookup Values

### Prerequisites

A lookup value can only be deleted if:
- No records are using it
- It's not the only option

### How to Delete

1. Navigate to the lookup management area
2. Click on the value
3. Click **"Delete"**
4. Confirm deletion

> ⚠️ **Warning:** Deletion is permanent. If records use this value, you must reassign them first.

---

## Best Practices

### Before Adding Data

Set up your lookup values before importing or creating records:

1. **Unit Categories** — Define all equipment types
2. **Unit Statuses** — Define operational states
3. **Equipment Types** — Define technical classifications
4. **Brands** — Add all manufacturers you service
5. **Contact Categories** — Define customer contact roles
6. **Mechanic Levels** — Define skill/certification levels

### Naming Conventions

- Use clear, professional terms
- Be consistent with capitalization
- Avoid abbreviations when possible
- Match industry-standard terminology

### Examples by Type

#### Unit Categories

| Good | Avoid |
|------|-------|
| Passenger Elevator | Pass. Elev |
| Freight Elevator | Freight |
| Escalator | Esc |
| Wheelchair Lift | WC Lift |
| Dumbwaiter | DW |

#### Unit Statuses

| Good | Avoid |
|------|-------|
| Operational | Works |
| Out of Service | OOS |
| Under Repair | Broken |
| Modernization | Mod |
| Pending Inspection | Needs Insp |

#### Equipment Types

| Good | Avoid |
|------|-------|
| Traction | Tract. |
| Hydraulic | Hydro |
| Machine Room Less (MRL) | MRL |
| Roped Hydraulic | R-Hyd |

---

## Lookup Values and Imports

When importing data via CSV:

1. **Existing Values** — Reference by exact name
2. **New Values** — Import will create them automatically
3. **Consistency** — Match spelling and capitalization exactly

> 📖 See [Data Import](./import.md) for import details.

---

## Common Lookup Setups

### Starter Set for Unit Categories

- Passenger Elevator
- Freight Elevator  
- Escalator
- Moving Walk
- Wheelchair Lift
- Dumbwaiter
- Stair Lift
- Material Lift

### Starter Set for Unit Statuses

- Operational
- Out of Service
- Under Repair
- Modernization
- Pending Inspection
- Shut Down
- Under Installation

### Starter Set for Inspection Statuses

- Scheduled
- In Progress
- Completed
- Pending Report
- Rescheduled
- Cancelled

### Starter Set for Inspection Results

- Passed
- Failed
- Conditional Pass
- Partial Pass
- Pending Review
- Waived

### Starter Set for Emergency Statuses

- Received
- Dispatched
- En Route
- On Site
- Resolved
- Cancelled
- False Alarm

---

## Troubleshooting

### Can't Delete a Lookup Value

- Check if any records are using it
- Find and reassign those records first
- Then delete the value

### Duplicate Values

If you accidentally created duplicates:
1. Decide which to keep
2. Edit records using the wrong one
3. Delete the duplicate

### Missing Values

If a needed value is missing:
1. Create it inline when adding a record
2. Or set it up in advance for consistency

---

## Permissions

| Action | Owner | Admin | Member |
|--------|-------|-------|--------|
| View lookup values | ✅ | ✅ | ✅ |
| Create lookup values | ✅ | ✅ | ❌ |
| Edit lookup values | ✅ | ✅ | ❌ |
| Delete lookup values | ✅ | ✅ | ❌ |

---

## Related Features

- [Units](../assets/units.md) — Uses categories, statuses, equipment types, brands
- [Contacts](../people/contacts.md) — Uses contact categories
- [Mechanics](../people/mechanics.md) — Uses mechanic levels
- [Inspections](../operations/inspections.md) — Uses inspection statuses and results
- [Emergency Calls](../emergency.md) — Uses emergency statuses
- [Data Import](./import.md) — References lookup values

---

*Lookup values are the foundation of clean data. Set them up thoughtfully before you start adding records.*

