# Emergency Calls

Emergency Calls track urgent service situations like stuck elevators, entrapments, or equipment failures requiring immediate response. Proper emergency tracking helps you respond quickly, document incidents, and analyze response patterns.

---

## Accessing Emergency Calls

1. Click **"Emergency Calls"** under the **Emergency** section in the sidebar
2. You'll see a list of all emergency call records

![Emergency calls list](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/emergency-calls-list.png)

---

## Understanding Emergency Calls

### What is an Emergency Call Record?

An emergency call documents:
- When the call came in
- Which unit has the emergency
- What the issue is
- Who responded
- When it was resolved
- Status throughout the process

### Emergency Calls vs. Other Records

| Record Type | Purpose | Urgency |
|-------------|---------|---------|
| **Emergency Calls** | Immediate response needed | Urgent |
| **Issue Reports** | Customer-reported problems | Variable |
| **Maintenance** | Scheduled service | Planned |
| **Jobs** | Assigned work | Variable |

---

## Viewing the Emergency Calls List

### List Features

| Feature | Description |
|---------|-------------|
| **Search** | Filter by emergency code, ticket number, description, or notes |
| **Archive Filter** | Show active, archived, or all calls |
| **Call Cards** | Click to view full details |

### Emergency Card Information

Each card displays:
- **Emergency Code** — Auto-generated identifier (e.g., "EM-0001")
- **Location** — Management company, building, and unit
- **Status** — Current resolution status
- **Mechanic** — Assigned responder (or "Unassigned")

![Emergency call cards](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/emergency-call-cards.png)

---

## Creating an Emergency Call

### When to Create

- Incoming call about a stuck elevator
- Entrapment situation
- Equipment malfunction requiring immediate attention
- Safety-related incidents
- After-hours urgent calls

### Step-by-Step Instructions

1. Navigate to **Emergency Calls** in the sidebar
2. Click **"Add emergency call"** button (top right)
3. Fill in the emergency form quickly
4. Click **"Create emergency call"**

![Emergency call form](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/emergency-call-form.png)

### Emergency Form Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **Management Company** | Yes | Select the company | "Acme Properties" |
| **Building** | Yes | Select the building | "Downtown Tower" |
| **Unit** | Yes | Select the unit | "E-1" |
| **Call In At** | Yes | When the call was received | 2024-01-15 09:30 AM |
| **Ticket Number** | No | External ticket reference | "T-12345" |
| **Status** | Yes | Current status | "Received", "Dispatched", etc. |
| **Mechanic** | No | Assigned responder | "John Smith" |
| **Issue Description** | Yes | What's happening | "Passenger stuck between floors" |
| **Completed At** | No | When resolved | 2024-01-15 10:45 AM |
| **Notes** | No | Additional details | "Fire dept called, 2 passengers..." |

---

## Emergency Codes

Each emergency call receives an auto-generated code:
- Format: `EM-XXXX` (e.g., EM-0001, EM-0002)
- Codes are sequential per workspace
- Useful for tracking and reference

---

## Emergency Statuses

Configure your own emergency statuses. Common examples:

| Status | Description |
|--------|-------------|
| **Received** | Call logged, not yet dispatched |
| **Dispatched** | Mechanic assigned and en route |
| **On Site** | Mechanic at the location |
| **Resolved** | Issue fixed |
| **Cancelled** | False alarm or duplicate |

> 📖 See [Lookup Values](./settings/lookup-values.md) for configuring statuses.

---

## Emergency Response Workflow

### Typical Flow

```
RECEIVED → DISPATCHED → ON SITE → RESOLVED
```

### Step-by-Step Response

1. **Call Comes In** — Create emergency record immediately
2. **Assess Situation** — Is there an entrapment? Other factors?
3. **Assign Mechanic** — Select your nearest available responder
4. **Update Status** — Mark as DISPATCHED
5. **Mechanic Arrives** — Update to ON SITE
6. **Issue Resolved** — Set COMPLETED AT time
7. **Update Status** — Mark as RESOLVED
8. **Document Details** — Add notes about what was done

---

## Viewing Emergency Details

### Accessing the Detail Page

Click any emergency call from the list.

![Emergency call detail](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/emergency-call-detail.png)

### Detail Page Information

- **Emergency Code** — Unique identifier
- **Ticket Number** — External reference
- **Location** — Full path (Company → Building → Unit)
- **Times** — Call in and completed at
- **Status** — Current state
- **Mechanic** — Assigned responder
- **Issue Description** — What was reported
- **Notes** — Additional details

### Actions Available

- **Edit** — Update emergency details
- **Archive/Restore** — Hide or restore the record
- **Delete** — Remove permanently (if allowed)

---

## Editing an Emergency Call

### Step-by-Step Instructions

1. Open the emergency detail page
2. Update any fields
3. Click **"Save changes"**

### Common Updates

- **Assign/reassign mechanic** — Change responder
- **Update status** — Progress through workflow
- **Set completed time** — When resolved
- **Add notes** — Document what happened

---

## Completing an Emergency

When the emergency is resolved:

1. Open the emergency record
2. Set the **Completed At** date/time
3. Update **Status** to your "resolved" status
4. Add notes describing:
   - What was wrong
   - What was done
   - Any follow-up needed
5. Click **"Save changes"**

---

## Dashboard Integration

Open emergencies appear on your dashboard:
- **Emergency Calls Count** — Shows open (unresolved) emergencies
- **Alerts Page** — Lists open emergencies as high-severity alerts
- **Activity Feed** — Shows recent emergency activity

---

## Technician View

The Technician View prominently displays open emergencies:
- Red alert section at the top
- Quick call button for the building
- Link to full details

> 📖 See [Technician View](./technician-view.md)

---

## Archiving Emergency Calls

### When to Archive

- Old resolved emergencies you want to hide
- Duplicate entries
- Test records

### How to Archive

1. Open the emergency detail page
2. Click the **⋮** menu button
3. Select **"Archive"**

### Viewing Archived Calls

1. On the Emergency Calls list
2. Click the **filter dropdown**
3. Select **"Archived"** or **"All"**

---

## Deleting an Emergency Call

### How to Delete

1. Open the emergency detail page
2. Click the **⋮** menu button
3. Select **"Delete"**
4. Confirm deletion

> ⚠️ **Warning:** Deletion is permanent. Consider archiving to preserve history.

---

## Best Practices

### Quick Entry

When a call comes in:
- Create the record immediately
- Enter essential info first (location, description)
- Add details after dispatching

### Clear Descriptions

Document the reported issue clearly:
- "Elevator stuck between 5th and 6th floor"
- "Passenger entrapment - 2 people inside"
- "Door won't close, car out of service"

### Mechanic Assignment

- Assign the closest available mechanic
- Consider current workload (check Dispatch)
- Update if reassignment needed

### Status Updates

- Update status as the situation progresses
- Record accurate times
- Don't leave emergencies in old states

### Detailed Notes

After resolution, document:
- Root cause (if known)
- Actions taken
- Parts used or needed
- Recommendations for follow-up
- Any customer concerns

### External References

- Use **Ticket Number** for answering service tickets
- Cross-reference with customer's internal systems
- Helps with billing and reporting

---

## Emergency Notifications

Uplio can send email alerts for emergency situations:
- **Emergency Alerts** — Immediate notification

Enable in Settings > Notification Preferences.

> 📖 See [Team Settings](./settings/team.md) for notification configuration.

---

## Permissions

| Role | Can View | Can Create | Can Edit | Can Archive | Can Delete |
|------|----------|------------|----------|-------------|------------|
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Member** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Related Features

- [Dashboard](./dashboard.md) — Monitor open emergencies
- [Dispatch](./operations/dispatch.md) — Manage daily operations
- [Technician View](./technician-view.md) — Mobile emergency access
- [Mechanics](./people/mechanics.md) — Assign responders
- [Issue Reports](./operations/issue-reports.md) — Customer-reported issues

---

*Emergency calls require immediate attention. Keep this section accurate for quick response and proper documentation.*


