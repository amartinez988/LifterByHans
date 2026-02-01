# Mechanics

Mechanics are your field technicians — the people who perform maintenance, respond to emergencies, and keep elevators running. Managing mechanic records helps you assign work, track certifications, and maintain service quality.

---

## Accessing Mechanics

1. Click **"Mechanics"** under the **People** section in the sidebar
2. You'll see a list of all mechanics in your workspace

![Mechanics list](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/mechanics-list.png)

---

## Understanding Mechanic Records

### What is a Mechanic Record?

A mechanic record stores:
- Personal contact information
- Skill level or certification
- Active/inactive status
- Link to assigned work (jobs, maintenance, emergencies)

### Mechanics vs. Team Members

| Feature | Mechanics | Team Members |
|---------|-----------|--------------|
| **Purpose** | Field work assignment | App login access |
| **Has login** | Not necessarily | Yes |
| **Appears in** | Job assignments | Team management |

A person can be both — a team member with app access AND a mechanic who gets assigned to jobs.

---

## Viewing the Mechanics List

### List Features

| Feature | Description |
|---------|-------------|
| **Search** | Filter by name, email, or phone |
| **Active Filter** | Show active, inactive, or all mechanics |
| **Mechanic Cards** | Click to view full details |

### Mechanic Card Information

Each card displays:
- **Full Name** — First and last name
- **Contact Info** — Email and phone
- **Level** — Skill/certification level
- **Status** — Active or Inactive badge

![Mechanic cards with status indicators](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/mechanic-cards.png)

---

## Creating a Mechanic

### Step-by-Step Instructions

1. Navigate to **Mechanics** in the sidebar
2. Click **"Add mechanic"** button (top right)
3. Fill in the mechanic form
4. Click **"Create mechanic"**

![New mechanic form](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/mechanic-form.png)

### Mechanic Form Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **First Name** | Yes | Mechanic's first name | "John" |
| **Last Name** | Yes | Mechanic's last name | "Smith" |
| **Email** | No | Contact email | "john@company.com" |
| **Phone** | No | Contact phone number | "(555) 123-4567" |
| **Level** | No | Skill/certification level | "Senior Mechanic" |
| **Active** | Yes | Whether currently available | ✅ Yes / ❌ No |

---

## Mechanic Levels

Mechanic levels help categorize technicians by skill or certification:

### Setting Up Levels

Levels are configurable lookup values. Examples:
- Junior Mechanic
- Mechanic
- Senior Mechanic
- Lead Technician
- Helper

### Using Levels

- Assign appropriate work based on skill
- Track career progression
- Filter mechanics by capability

> 📖 See [Lookup Values](../settings/lookup-values.md) for configuring levels.

---

## Viewing Mechanic Details

### Accessing the Detail Page

Click any mechanic from the list.

![Mechanic detail page](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/mechanic-detail.png)

### Detail Page Information

- **Name** — Full name
- **Contact Info** — Email and phone
- **Level** — Assigned skill level
- **Status** — Active or inactive

### Actions Available

- **Edit** — Update mechanic information
- **Deactivate/Reactivate** — Toggle active status
- **Delete** — Remove if no related records

---

## Editing a Mechanic

### Step-by-Step Instructions

1. Open the mechanic detail page
2. Update any fields in the form
3. Click **"Save mechanic"**

### Common Updates

- **Change level** — Update as skills improve
- **Update contact info** — New phone or email
- **Toggle active status** — When leaving or returning

---

## Active vs. Inactive Status

### Active Mechanics

- Appear in job assignment dropdowns
- Can be dispatched to work
- Included in workload tracking

### Inactive Mechanics

- Hidden from assignment dropdowns
- Historical records preserved
- Can be reactivated later

### When to Deactivate

- Mechanic left the company
- Extended leave or vacation
- No longer performing field work

### How to Deactivate

1. Open the mechanic detail page
2. Uncheck the **"Active"** checkbox
3. Save changes

---

## Assigning Mechanics to Work

Mechanics can be assigned to:

### Jobs

1. When creating or editing a job
2. Select from the **Mechanic** dropdown
3. Only active mechanics appear

> 📖 See [Jobs](../operations/jobs.md)

### Maintenance Records

1. When creating or editing maintenance
2. Select from the **Mechanic** dropdown
3. Tracks who performed the work

> 📖 See [Maintenance](../operations/maintenance.md)

### Emergency Calls

1. When logging an emergency
2. Select the responding mechanic
3. Tracks emergency response

> 📖 See [Emergency Calls](../emergency.md)

---

## Mechanics and Dispatch

On the Dispatch page:
- **Workload bars** show jobs per mechanic
- **Quick assign** lets you rapidly assign unassigned jobs
- **Filter by mechanic** shows individual workloads

> 📖 See [Dispatch](../operations/dispatch.md)

---

## Mechanics and Technician View

If a mechanic's email matches a user's email:
- Technician View shows only their assigned jobs
- Personalized greeting uses their name
- Mobile experience is tailored to them

This connection happens automatically through email matching.

---

## Deleting a Mechanic

### Prerequisites

A mechanic can only be deleted if they have:
- No assigned jobs
- No maintenance records
- No emergency calls

### How to Delete

1. Open the mechanic detail page
2. Click the **⋮** menu button
3. Select **"Delete"**
4. Confirm the permanent deletion

> ⚠️ **Warning:** Instead of deleting, consider deactivating to preserve history.

---

## Searching and Filtering

### Search

The search box filters mechanics by:
- First name
- Last name
- Email
- Phone number

### Active Filter Options

| Option | Shows |
|--------|-------|
| **Active** | Only active mechanics |
| **Inactive** | Only inactive mechanics |
| **All** | Both active and inactive |

---

## Best Practices

### Complete Contact Information

- Include both email AND phone
- Keep information up to date
- Verify numbers periodically

### Meaningful Levels

- Define levels that match your organization
- Use levels consistently
- Update levels as skills develop

### Managing Status

- Deactivate promptly when someone leaves
- Reactivate when they return
- Don't delete unnecessarily

### Team Integration

If mechanics need app access:
1. Create them as a mechanic
2. Also invite them as a team member
3. Use the same email for both

---

## Permissions

| Role | Can View | Can Create | Can Edit | Can Delete |
|------|----------|------------|----------|------------|
| **Owner** | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Member** | ✅ | ❌ | ❌ | ❌ |

---

## Related Features

- [Jobs](../operations/jobs.md) — Assign mechanics to work
- [Dispatch](../operations/dispatch.md) — View mechanic workload
- [Technician View](../technician-view.md) — Mobile mechanic interface
- [Team](../settings/team.md) — User account management
- [Lookup Values](../settings/lookup-values.md) — Configure mechanic levels

---

*Your mechanics are the backbone of your service. Keep their records accurate and up to date.*


