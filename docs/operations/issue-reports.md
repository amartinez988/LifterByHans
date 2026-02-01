# Issue Reports

Issue Reports capture problems reported by building occupants who scan your elevator QR codes. This customer-facing feature allows anyone to quickly report issues, creating a direct communication channel with your service team.

---

## How Issue Reports Work

1. **You place QR codes** on elevator units
2. **Building occupants scan** the QR code with their phone
3. **They view unit info** and can report problems
4. **Reports appear** in your Issue Reports dashboard
5. **You manage** and resolve the issues

---

## Accessing Issue Reports

1. Click **"Issue Reports"** under the **Operations** section in the sidebar
2. You'll see all reported issues with status indicators

![Issue reports page](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/issue-reports-page.png)

---

## Understanding the Issue Reports Page

### Statistics Cards

Three cards at the top show:

| Card | Description | Color |
|------|-------------|-------|
| **New Reports** | Unacknowledged issues requiring attention | Red |
| **In Progress** | Issues being worked on | Blue |
| **Total Reports** | All reports in the system | Gray |

### Issue List

Below the stats, issues are listed with:
- **Issue Type Icon** — Visual indicator of problem category
- **Issue Type Label** — What kind of problem
- **Status Badge** — Current resolution state
- **Unit Link** — Which unit has the issue
- **Building Name** — Location
- **Description** — Details from reporter (if provided)
- **Contact Info** — Reporter's contact (if provided)
- **Report Time** — When it was submitted

![Issue report items](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/issue-report-items.png)

---

## Issue Types

When reporting, users select from predefined issue types:

| Type | Icon | Description |
|------|------|-------------|
| **Elevator stuck** | 🚫 | Elevator is not moving |
| **Strange noise** | 🔊 | Unusual sounds during operation |
| **Door issue** | 🚪 | Doors not opening/closing properly |
| **Button not working** | 🔘 | Floor or call buttons malfunctioning |
| **Light out** | 💡 | Lighting issues in car |
| **Other issue** | ❓ | Any other problem |

---

## Issue Statuses

| Status | Color | Description |
|--------|-------|-------------|
| **NEW** | Red | Just reported, not yet reviewed |
| **ACKNOWLEDGED** | Yellow | You've seen it, investigation pending |
| **IN_PROGRESS** | Blue | Actively being worked on |
| **RESOLVED** | Green | Issue has been fixed |
| **DISMISSED** | Gray | Not valid or duplicate |

---

## Managing Issue Reports

### Viewing an Issue

Each issue in the list shows key information at a glance. Click the unit link to see the full unit details.

### Updating Issue Status

1. Find the issue in the list
2. Click the action menu (dropdown or buttons)
3. Select the new status:
   - **Acknowledge** — Mark as seen
   - **In Progress** — Start working on it
   - **Resolve** — Mark as fixed
   - **Dismiss** — Mark as not actionable

### Status Workflow

```
NEW → ACKNOWLEDGED → IN_PROGRESS → RESOLVED
                ↘ DISMISSED
```

---

## Responding to Issues

### New Issue Workflow

1. **Review the report** — Read the issue type and description
2. **Assess urgency** — Is this an emergency or routine?
3. **Acknowledge** — Update status to ACKNOWLEDGED
4. **Create a job** — If work is needed, schedule it
5. **Dispatch mechanic** — Assign someone to investigate
6. **Update status** — Move to IN_PROGRESS
7. **Resolve** — Mark as RESOLVED when fixed

### For Emergencies

If the issue indicates an emergency (stuck elevator with passengers):
1. Immediately acknowledge the report
2. Contact emergency services if needed
3. Dispatch your nearest mechanic
4. Create an Emergency Call record
5. Update the issue report as you work

> 📖 See [Emergency Calls](../emergency.md) for emergency procedures.

---

## Contact Information

Reporters can optionally provide contact information:
- Displayed on the issue report
- Use this to follow up with the person
- Helpful for clarifying the issue

> 💡 **Tip:** Contact info is optional. Many reports may not include it.

---

## Linking to Units

Each issue report is linked to a specific unit:
- Click the **unit identifier** to view the unit
- See the unit's full service history
- Create maintenance or jobs from the unit page

---

## Empty State

When no issue reports exist:
- The page shows a helpful message
- Explains that reports come from QR code scans
- Encourages you to deploy QR codes

---

## Setting Up QR Codes

To receive issue reports, you must have QR codes deployed:

1. Navigate to any **Unit** detail page
2. Find the **QR Code** section
3. Click **"Show QR Code"**
4. Download and print the QR code
5. Attach to the elevator car or machine room

> 📖 See [Units](../assets/units.md) for QR code details.

---

## The Public Issue Report Form

When users scan a QR code and visit the public unit page, they see:

### Quick Issue Form

- **Issue Type Selector** — Buttons for each issue type
- **Description Field** — Optional details
- **Contact Field** — Optional way to reach them
- **Submit Button** — Sends the report

### After Submitting

Users see a confirmation that their report was received.

![Public issue form](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/public-issue-form.png)

---

## Best Practices

### Responding Quickly

- Check Issue Reports regularly (at least daily)
- Acknowledge new reports promptly
- Customers appreciate quick acknowledgment

### Prioritizing Issues

| Issue Type | Typical Priority |
|------------|------------------|
| Elevator stuck | Urgent/Emergency |
| Strange noise | Normal to High |
| Door issue | High (safety concern) |
| Button not working | Normal |
| Light out | Low |
| Other | Varies |

### Documentation

- Link issue reports to jobs when you create them
- Note the issue report code in job notes
- Update the issue status as work progresses

### Customer Communication

If contact info is provided:
- Consider reaching out to acknowledge
- Provide updates on resolution
- Thank them for reporting

### Dismissing Issues

Use DISMISSED status for:
- Duplicate reports
- Invalid or spam reports
- Issues that aren't actually problems
- Reports for units you don't service

---

## Dashboard Integration

Issue Reports affect your dashboard:
- Recent issue reports appear in the **Activity Feed**
- High volume of new reports indicates attention needed

---

## Permissions

| Role | Can View | Can Update Status | Can Dismiss |
|------|----------|-------------------|-------------|
| **Owner** | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ |
| **Member** | ✅ | ❌ | ❌ |

---

## Related Features

- [Units](../assets/units.md) — QR code generation and unit management
- [Jobs](./jobs.md) — Create work orders for issues
- [Emergency Calls](../emergency.md) — Handle urgent situations
- [Maintenance](./maintenance.md) — Document repairs

---

*Issue Reports give building occupants a voice. Monitor them closely to catch problems early and keep your customers happy.*


