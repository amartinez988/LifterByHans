# Maintenance Records

Maintenance records track regular service visits, preventive maintenance, and routine upkeep of your elevator and escalator units. They help you maintain compliance, document work performed, and track service history.

---

## Accessing Maintenance

1. Click **"Maintenance"** under the **Operations** section in the sidebar
2. You'll see a list of all maintenance records across your workspace

![Maintenance list](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/maintenance-list.png)

---

## Understanding Maintenance Records

### What is a Maintenance Record?

A maintenance record documents a scheduled or completed maintenance visit for a specific unit. It includes:

- Which unit was serviced
- When the maintenance occurred
- Who performed the work
- What was done (via notes)
- Current status (Open or Completed)

### Maintenance vs. Jobs

| Feature | Maintenance | Jobs |
|---------|-------------|------|
| **Purpose** | Document service events | Schedule work assignments |
| **Mechanic tracking** | Optional | Can be assigned |
| **Status options** | Open, Completed | Scheduled, En Route, On Site, Completed, Cancelled |
| **Calendar view** | ❌ | ✅ (Schedule page) |

> 💡 **Tip:** Use Maintenance for documenting service visits. Use Jobs for scheduling and dispatching work.

---

## Viewing the Maintenance List

### List Features

| Feature | Description |
|---------|-------------|
| **Search** | Filter by maintenance code or notes |
| **Archive Filter** | Toggle between active, archived, or all records |
| **Record Cards** | Click any record to view details |

### Maintenance Card Information

Each card displays:
- **Maintenance Code** — Auto-generated unique identifier (e.g., "M-0001")
- **Location** — Management company, building, and unit
- **Mechanic** — Assigned technician (or "Unassigned")
- **Status** — OPEN or COMPLETED

![Maintenance cards](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/maintenance-cards.png)

---

## Creating a Maintenance Record

### Step-by-Step Instructions

1. Navigate to **Maintenance** in the sidebar
2. Click **"Add maintenance"** button (top right)
3. Fill in the maintenance form
4. Click **"Create maintenance"**

![Maintenance form](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/maintenance-form.png)

### Maintenance Form Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **Management Company** | Yes | Select the company | "Acme Properties" |
| **Building** | Yes | Select the building (filtered by company) | "Downtown Tower" |
| **Unit** | Yes | Select the specific unit | "E-1" |
| **Maintenance Date** | Yes | When the maintenance occurs/occurred | 2024-01-15 |
| **Mechanic** | No | Assign a technician | "John Smith" |
| **Status** | Yes | Current status | Open or Completed |
| **Notes** | No | Work performed, observations, issues | "Replaced door rollers..." |

### Cascading Selection

When selecting location:
1. First, choose the **Management Company**
2. The **Building** dropdown shows only buildings for that company
3. The **Unit** dropdown shows only units in that building

---

## Maintenance Codes

Each maintenance record receives an auto-generated code:
- Format: `M-XXXX` (e.g., M-0001, M-0002)
- Codes are sequential per workspace
- Cannot be changed after creation

> 💡 **Tip:** Use maintenance codes when referencing records in communications.

---

## Maintenance Statuses

| Status | Description | When to Use |
|--------|-------------|-------------|
| **OPEN** | Maintenance is scheduled or in progress | Default for new records |
| **COMPLETED** | Maintenance work is finished | When work is done |

---

## Viewing Maintenance Details

### Accessing the Detail Page

Click any maintenance record from the list.

![Maintenance detail](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/maintenance-detail.png)

### Detail Page Information

- **Maintenance Code** — Unique identifier
- **Status Badge** — OPEN or COMPLETED
- **Location** — Full path (Company → Building → Unit) with links
- **Maintenance Date** — When the work was performed
- **Mechanic** — Assigned technician
- **Notes** — Detailed service notes

### Actions Available

- **Edit** — Update status, date, mechanic, or notes
- **Create Job** — Generate a scheduled job from this maintenance
- **Archive/Restore** — Hide or restore the record
- **Delete** — Permanently remove (if allowed)

---

## Editing a Maintenance Record

### Step-by-Step Instructions

1. Open the maintenance detail page
2. Update any fields:
   - Change status from OPEN to COMPLETED
   - Update the maintenance date
   - Assign or change the mechanic
   - Add or edit notes
3. Click **"Save changes"**

---

## Completing Maintenance

To mark maintenance as complete:

1. Open the maintenance record
2. Change **Status** to **COMPLETED**
3. Add notes describing work performed
4. Click **"Save changes"**

> 💡 **Best Practice:** Always add detailed notes when completing maintenance. This creates a valuable service history.

---

## Creating a Job from Maintenance

You can create a scheduled job from an open maintenance record:

1. Open the maintenance detail page
2. Click **"Create Job"** button (if available)
3. A new job form opens pre-filled with the maintenance details
4. Add scheduling information (date, time, priority)
5. Save the job

The maintenance and job will be linked together.

---

## Archiving Maintenance Records

### When to Archive

- Record was created in error
- Duplicate entry
- No longer relevant (but want to preserve for history)

### How to Archive

1. Open the maintenance detail page
2. Click the **⋮** menu button
3. Select **"Archive"**
4. Confirm the action

### Viewing Archived Records

1. On the Maintenance list page
2. Click the **filter dropdown**
3. Select **"Archived"** or **"All"**

---

## Deleting a Maintenance Record

### Prerequisites

A maintenance record can only be deleted if:
- It has no linked job

### How to Delete

1. Open the maintenance detail page
2. Click the **⋮** menu button
3. Select **"Delete"**
4. Confirm the permanent deletion

> ⚠️ **Warning:** Deletion is permanent. Archive records to preserve history.

---

## Searching and Filtering

### Search

The search box filters maintenance by:
- Maintenance code
- Notes content

### Archive Filter Options

| Option | Shows |
|--------|-------|
| **Active** | Only non-archived records |
| **Archived** | Only archived records |
| **All** | Both active and archived |

---

## Dashboard Integration

Open maintenance records appear on your dashboard:
- **Maintenance Count** — Shows number of OPEN maintenance records
- **Alerts Page** — Lists all open maintenance as action items

---

## Best Practices

### When to Create Maintenance Records

- Scheduled preventive maintenance visits
- Annual service calls
- Monthly check-ups
- Any routine service work

### Notes Documentation

Include in your notes:
- Work performed
- Parts replaced or ordered
- Observations about equipment condition
- Recommendations for future work
- Any issues encountered

### Status Management

- Create records with OPEN status when scheduling
- Update to COMPLETED when work is finished
- Don't forget to close out old records

### Mechanic Assignment

- Assign mechanics when scheduling
- Update if the assignment changes
- Leave unassigned if work is contracted out

---

## Maintenance vs. Other Records

| Record Type | Best For |
|-------------|----------|
| **Maintenance** | Documenting regular service visits |
| **Jobs** | Scheduling and dispatching specific work |
| **Inspections** | Regulatory inspection tracking |
| **Emergency Calls** | Urgent service responses |

---

## Permissions

| Role | Can View | Can Create | Can Edit | Can Archive | Can Delete |
|------|----------|------------|----------|-------------|------------|
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Member** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Related Features

- [Jobs](./jobs.md) — Schedule and dispatch work
- [Schedule](./schedule.md) — Calendar view of jobs
- [Units](../assets/units.md) — View unit service history
- [Mechanics](../people/mechanics.md) — Manage technician assignments

---

*Maintenance records build your service history. Document thoroughly for compliance and customer transparency.*


