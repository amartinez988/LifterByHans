# Jobs (Scheduled Work)

Jobs are the central work scheduling feature in Uplio. Use jobs to plan, assign, and track service assignments for your mechanics. Jobs appear on the Schedule calendar and can be managed from the Dispatch center.

---

## Accessing Jobs

1. Click **"Jobs"** under the **Operations** section in the sidebar
2. You'll see a list of all scheduled jobs across your workspace

![Jobs list](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/jobs-list.png)

---

## Understanding Jobs

### What is a Job?

A job represents a scheduled work assignment:
- A specific task to be performed
- At a specific location (building/unit)
- On a specific date (with optional time)
- Optionally assigned to a mechanic
- With a status that tracks progress

### Job Types

| Type | Description | Example |
|------|-------------|---------|
| **Maintenance** | Regular preventive maintenance | Monthly PM visit |
| **Inspection** | Preparing for or assisting with inspections | Pre-inspection check |
| **Emergency** | Follow-up on emergency calls | Emergency callback |
| **Callback** | Return visit for previous issue | Address customer complaint |
| **Other** | Any other work type | Modernization consultation |

### Job Priorities

| Priority | Color | Use For |
|----------|-------|---------|
| **Low** | Gray | Non-urgent, flexible timing |
| **Normal** | Default | Standard scheduled work |
| **High** | Orange | Important, should be done soon |
| **Urgent** | Red | Critical, immediate attention |

---

## Viewing the Jobs List

### List Features

| Feature | Description |
|---------|-------------|
| **Search** | Filter by job code, title, description, or notes |
| **Status Filter** | View jobs by status (All, Scheduled, En Route, etc.) |
| **Mechanic Filter** | View jobs by assigned mechanic |
| **Archive Filter** | Toggle between active, archived, or all jobs |

### Job Card Information

Each job card displays:
- **Job Code** — Auto-generated identifier (e.g., "J-0001")
- **Status Badge** — Current status with color coding
- **Title** — Brief description of the work
- **Location** — Management company, building, and unit
- **Mechanic** — Assigned technician (or "Unassigned")
- **Date/Time** — Scheduled date and start time
- **Priority** — Priority level indicator

> 📸 *Screenshot: Job cards with status colors*

---

## Job Statuses

| Status | Color | Description | Typical Use |
|--------|-------|-------------|-------------|
| **SCHEDULED** | Blue | Job is planned | Initial state |
| **EN_ROUTE** | Yellow | Mechanic is traveling to site | Dispatched |
| **ON_SITE** | Orange | Mechanic is at the location | Working |
| **COMPLETED** | Green | Work is finished | Done |
| **CANCELLED** | Gray | Job was cancelled | Not performed |

> 📸 *Screenshot: Status progression diagram*

---

## Creating a Job

### Step-by-Step Instructions

1. Navigate to **Jobs** in the sidebar
2. Click **"Add job"** button (top right)
3. Fill in the job form
4. Click **"Create job"**

![Job form](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/job-form.png)

### Job Form Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **Title** | Yes | Brief description of the work | "Monthly PM" |
| **Job Type** | Yes | Type of work | Maintenance, Inspection, etc. |
| **Priority** | Yes | Urgency level | Normal, High, Urgent |
| **Management Company** | Yes | Select the company | "Acme Properties" |
| **Building** | Yes | Select the building | "Downtown Tower" |
| **Unit** | No | Specific unit (optional) | "E-1" |
| **Scheduled Date** | Yes | When the job should be done | 2024-01-15 |
| **Start Time** | No | Planned start time | 09:00 |
| **End Time** | No | Planned end time | 11:00 |
| **Status** | Yes | Current status | SCHEDULED |
| **Mechanic** | No | Assigned technician | "John Smith" |
| **Description** | No | Detailed work description | "Perform monthly PM..." |
| **Notes** | No | Internal notes | "Customer requested morning" |

### Cascading Selection

When selecting location:
1. First, choose the **Management Company**
2. The **Building** dropdown shows only buildings for that company
3. The **Unit** dropdown shows only units in that building

---

## Job Codes

Each job receives an auto-generated code:
- Format: `J-XXXX` (e.g., J-0001, J-0002)
- Codes are sequential per workspace
- Cannot be changed after creation

---

## Viewing Job Details

### Accessing the Detail Page

Click any job from the list, schedule, or dispatch views.

> 📸 *Screenshot: Job detail page*

### Detail Page Information

- **Job Code and Title**
- **Status Badge** — Current status with color
- **Location Details** — Full path with links
- **Schedule** — Date and times
- **Mechanic** — Assignment
- **Description and Notes**
- **Priority and Type** — Job classification

### Actions Available

- **Edit** — Update any job details
- **Update Status** — Quick status change buttons
- **Archive/Restore** — Hide or restore the job
- **Delete** — Permanently remove (if allowed)

---

## Editing a Job

### Step-by-Step Instructions

1. Open the job detail page
2. Update any fields in the form
3. Click **"Save job"**

### Common Edits

- **Reassign mechanic** — Change the assigned technician
- **Reschedule** — Update date or time
- **Change status** — Move through the workflow
- **Add notes** — Document updates or issues

---

## Status Workflow

### Typical Job Progression

```
SCHEDULED → EN_ROUTE → ON_SITE → COMPLETED
```

### Updating Status

1. Open the job detail page
2. Change the **Status** dropdown
3. Click **"Save job"**

Or use quick status buttons on the detail page (if available).

### Cancelling a Job

1. Open the job detail page
2. Change status to **CANCELLED**
3. Add notes explaining why
4. Click **"Save job"**

---

## Assigning Mechanics

### When Creating a Job

1. In the job form, select a mechanic from the dropdown
2. Leave as "Unassigned" if not yet determined

### Reassigning a Job

1. Open the job detail page
2. Change the **Mechanic** selection
3. Click **"Save job"**

### Quick Assignment (Dispatch)

From the Dispatch page, use the quick-assign dropdown to rapidly assign unassigned jobs.

> 📖 See [Dispatch](./dispatch.md) for more on rapid assignment.

---

## Filtering Jobs

### By Status

Click status filter buttons at the top:
- **All** — Show all jobs
- **SCHEDULED** — Only scheduled jobs
- **EN_ROUTE** — Only en-route jobs
- **ON_SITE** — Only on-site jobs
- **COMPLETED** — Only completed jobs
- **CANCELLED** — Only cancelled jobs

### By Mechanic

1. Find the mechanic filter row
2. Click on a mechanic's name
3. List shows only jobs assigned to that mechanic

### By Search

Type in the search box to filter by:
- Job code
- Title
- Description
- Notes

---

## Jobs on the Calendar

Jobs appear on the Schedule calendar view:
- Color-coded by status
- Shows start time (if set)
- Click to open job details

> 📖 See [Schedule](./schedule.md) for calendar usage.

---

## Jobs in Dispatch

The Dispatch page shows:
- Today's jobs organized by status
- Unassigned job queue
- Mechanic workload
- Upcoming jobs

> 📖 See [Dispatch](./dispatch.md) for dispatch operations.

---

## Archiving Jobs

### When to Archive

- Completed jobs you want to hide from the main list
- Old cancelled jobs
- Test or duplicate entries

### How to Archive

1. Open the job detail page
2. Click the **⋮** menu button
3. Select **"Archive"**

### Viewing Archived Jobs

1. On the Jobs list page
2. Click the **archive filter dropdown**
3. Select **"Archived"** or **"All"**

---

## Deleting a Job

### Prerequisites

Jobs can typically be deleted if they haven't been linked to other records.

### How to Delete

1. Open the job detail page
2. Click the **⋮** menu button
3. Select **"Delete"**
4. Confirm the permanent deletion

> ⚠️ **Warning:** Deletion is permanent. Archive jobs to preserve history.

---

## Best Practices

### Titles

- Keep titles brief but descriptive
- Include the type of work
- Examples: "Monthly PM", "Emergency Callback", "Pre-Inspection Prep"

### Descriptions

Use descriptions for:
- Detailed scope of work
- Special instructions
- Customer requirements
- Reference to previous issues

### Notes

Use notes for:
- Internal comments
- Dispatch instructions
- Updates as work progresses
- Why a job was cancelled

### Scheduling

- Set realistic time windows
- Consider travel time between jobs
- Account for complexity of work
- Leave buffer for unexpected issues

### Status Updates

- Update status as work progresses
- Don't leave jobs in old states
- Mark cancelled jobs as CANCELLED (not just abandoned)

---

## Permissions

| Role | Can View | Can Create | Can Edit | Can Archive | Can Delete |
|------|----------|------------|----------|-------------|------------|
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Member** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Related Features

- [Schedule](./schedule.md) — Calendar view of jobs
- [Dispatch](./dispatch.md) — Real-time job management
- [Maintenance](./maintenance.md) — Document maintenance visits
- [Technician View](../technician-view.md) — Mobile job access

---

*Jobs are your daily work orders. Keep them updated for accurate scheduling and dispatching.*


