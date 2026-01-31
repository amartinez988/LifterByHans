# Dispatch (Operations Center)

The Dispatch page is your real-time operations center. It provides an at-a-glance view of today's work, unassigned jobs, mechanic workload, and upcoming jobs — everything you need to manage daily field operations.

---

## Accessing Dispatch

1. Click **"Dispatch"** under the **Operations** section in the sidebar
2. You'll see the operations center focused on today

> 📸 *Screenshot: Dispatch operations center overview*

---

## Dispatch Layout

The Dispatch page is organized into several sections:

### Header

- **Page Title** — "Operations center"
- **Today's Date** — Full date display (e.g., "Monday, January 15, 2024")
- **Quick Links** — View calendar, Add job

### Quick Stats

Four metric cards at the top:

| Metric | Description |
|--------|-------------|
| **Active jobs today** | Jobs in progress (not completed or cancelled) |
| **Scheduled** | Jobs waiting to be started |
| **In progress** | Jobs that are EN_ROUTE or ON_SITE |
| **Completed** | Jobs finished today |

---

## Today's Jobs

### Overview

The left column shows all jobs scheduled for today, organized by status:

1. **SCHEDULED** — Jobs ready to be dispatched
2. **EN_ROUTE** — Mechanics traveling to sites
3. **ON_SITE** — Work currently in progress
4. **COMPLETED** — Finished jobs

### Job Cards

Each job card shows:
- **Job Code** — Unique identifier
- **Title** — Brief description
- **Location** — Building and unit
- **Start Time** — If scheduled
- **Mechanic** — Assigned technician

### Status Colors

| Status | Background Color |
|--------|------------------|
| SCHEDULED | Light blue |
| EN_ROUTE | Light yellow |
| ON_SITE | Light orange |
| COMPLETED | Light green |

### Clicking Jobs

Click any job card to open its detail page for editing or status updates.

> 📸 *Screenshot: Today's jobs section with status groups*

---

## Unassigned Queue

### Purpose

The unassigned queue shows jobs that don't have a mechanic assigned yet. These need attention before they can be dispatched.

### What's Shown

- Jobs from any date (not just today)
- Only jobs without a mechanic
- Excludes cancelled jobs
- Limited to most urgent items

### Quick Assignment

For each unassigned job:
1. Click the dropdown button next to the job
2. Select a mechanic from the list
3. The job is immediately assigned

> 📸 *Screenshot: Unassigned queue with quick-assign dropdown*

---

## Mechanic Workload

### Purpose

Visual indicator of how busy each mechanic is today.

### Display

Each mechanic shows:
- **Name** — Mechanic's name
- **Progress Bar** — Visual workload indicator
- **Job Count** — Number of jobs assigned today

### Workload Colors

| Color | Meaning |
|-------|---------|
| 🟢 Green | Light workload (0-3 jobs) |
| 🟡 Yellow | Moderate workload (4-5 jobs) |
| 🔴 Red | Heavy workload (6+ jobs) |

### Using Workload Data

- Identify overloaded mechanics
- Find mechanics with capacity
- Balance job distribution

> 📸 *Screenshot: Mechanic workload bars*

---

## Upcoming Jobs

### Purpose

Shows jobs scheduled for the next 7 days (excluding today).

### What's Shown

- Job code and building
- Scheduled date (weekday, month, day)
- Assigned mechanic (or "Unassigned")
- Excludes cancelled jobs

### Planning Ahead

Use this section to:
- Prepare for upcoming work
- Identify unassigned future jobs
- Spot scheduling conflicts

> 📸 *Screenshot: Upcoming jobs list*

---

## Using Dispatch for Daily Operations

### Morning Routine

1. **Open Dispatch** — Start your day here
2. **Check Active Jobs** — Review what's scheduled
3. **Assign Unassigned Jobs** — Clear the queue
4. **Review Workload** — Balance if needed
5. **Check Upcoming** — Prepare for tomorrow

### Throughout the Day

1. **Monitor Progress** — Watch jobs move through statuses
2. **Handle Emergencies** — React to urgent situations
3. **Reassign if Needed** — Adjust for problems
4. **Update Statuses** — Keep information current

### End of Day

1. **Review Completed** — Confirm all done jobs
2. **Check Remaining** — Address anything still open
3. **Prepare Tomorrow** — Review upcoming section

---

## Quick Actions

### Add Job

Click **"Add job"** to create a new scheduled job.

### View Calendar

Click **"View calendar →"** to open the Schedule page for broader planning.

---

## No Jobs State

When there are no jobs scheduled for today:
- Message indicates "No jobs scheduled for today"
- Focus shifts to unassigned and upcoming sections

---

## Real-Time Updates

The Dispatch page shows data as of page load. To refresh:
- Refresh your browser (F5 or browser refresh)
- Navigate away and back to Dispatch

> 💡 **Tip:** Refresh periodically during busy times to see the latest status updates.

---

## Dispatch vs. Schedule

| Feature | Dispatch | Schedule |
|---------|----------|----------|
| **Focus** | Today and immediate | Any date range |
| **View** | List-based | Calendar-based |
| **Workload** | Shows mechanic load | No workload view |
| **Quick Assign** | Yes | No |
| **Best For** | Daily operations | Planning ahead |

Use both:
- **Schedule** for planning future work
- **Dispatch** for managing today

---

## Tips for Effective Dispatching

### Stay Organized

- Keep the unassigned queue empty
- Regularly refresh the page
- Update job statuses promptly

### Balance Workload

- Distribute jobs fairly across mechanics
- Consider skill levels for complex jobs
- Account for geography and travel time

### Handle Emergencies

When an emergency comes in:
1. Create a new job with URGENT priority
2. Assign your closest available mechanic
3. Update status as they respond

### Communication

- Use job notes for dispatch instructions
- Document mechanic feedback
- Keep records current for customer inquiries

---

## Mobile Access

The Dispatch page is responsive but designed primarily for desktop dispatch operations. For field technicians, use the [Technician View](../technician-view.md).

---

## Permissions

All users can view Dispatch. Only Owners and Admins can:
- Quick-assign mechanics
- Create new jobs
- Update job details

| Role | Can View | Can Quick Assign | Can Create Jobs |
|------|----------|------------------|-----------------|
| **Owner** | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ |
| **Member** | ✅ | ❌ | ❌ |

---

## Related Features

- [Jobs](./jobs.md) — Create and manage work orders
- [Schedule](./schedule.md) — Calendar view for planning
- [Technician View](../technician-view.md) — Mobile interface for mechanics
- [Mechanics](../people/mechanics.md) — Manage your field team

---

*Dispatch is your command center for daily operations. Keep it open throughout the day to stay on top of your field work.*
