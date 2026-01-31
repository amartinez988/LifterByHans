# Dashboard

The Dashboard is your central command center in Uplio. It provides an at-a-glance view of your operations, compliance status, and recent activity.

---

## Accessing the Dashboard

1. Click **"Overview"** under the **Dashboard** section in the sidebar
2. Or click your company name in the top-left corner

> 📸 *Screenshot: Main dashboard view showing all metric cards and charts*

---

## Dashboard Components

### Key Metrics Cards

The dashboard displays four primary metric cards at the top:

#### 1. Compliance Rate

| Element | Description |
|---------|-------------|
| **Percentage** | Shows the percentage of units with valid, non-expired inspections |
| **Fraction** | Shows "X of Y units compliant" |
| **Expiring Soon** | Warning indicator if inspections are expiring within 30 days |

**What it measures:** Units that have passed their most recent inspection and the inspection has not expired.

> 💡 **Tip:** Click this card to view the Compliance page with detailed breakdowns.

#### 2. Emergency Calls

| Element | Description |
|---------|-------------|
| **Count** | Number of currently open (unresolved) emergency calls |
| **Label** | "Open calls requiring attention" |

**What it measures:** Emergency calls that have been logged but not yet completed.

> ⚠️ **Warning:** High numbers here indicate urgent attention needed.

#### 3. Maintenance

| Element | Description |
|---------|-------------|
| **Count** | Number of active maintenance events |
| **Status** | Shows maintenance records with "OPEN" status |

**What it measures:** Maintenance work that has been scheduled or is in progress.

#### 4. Units at Risk

| Element | Description |
|---------|-------------|
| **Count** | Total units that are overdue or missing inspections |
| **Color** | Red when there are at-risk units, green when all units are compliant |

**What it measures:** Units where the inspection has expired OR no inspection has ever been recorded.

> 📸 *Screenshot: The four metric cards in a row*

---

## Compliance Forecast Chart

The Compliance Forecast shows how your compliance status will change over the next 12 months.

### Reading the Chart

- **X-Axis:** Timeline (months ahead)
- **Y-Axis:** Number of compliant units
- **Line:** Projected compliance if no action is taken

### What It Shows

The chart projects what happens as inspection expiration dates pass. It helps you:

- Identify when compliance will drop
- Plan inspection renewals in advance
- Prioritize units that need attention soon

> 📸 *Screenshot: Compliance forecast line chart*

---

## Recent Activity Feed

The Recent Activity section shows a chronological list of events across your operations.

### Activity Types

| Icon | Activity Type | Description |
|------|---------------|-------------|
| 📋 | Inspection | Inspection was performed |
| 🔧 | Maintenance | Maintenance event scheduled or completed |
| 🚨 | Emergency | Emergency call received or resolved |
| ⚠️ | Issue Report | Issue reported via QR code scan |

### Activity Details

Each activity shows:
- **Type indicator** — Icon and color coding
- **Unit identifier** — Which unit was involved
- **Status/Result** — What happened (e.g., "Passed", "OPEN", "COMPLETED")
- **Timestamp** — When it occurred

> 📸 *Screenshot: Recent activity feed showing mixed activity types*

---

## Quick Actions

At the bottom of the dashboard, you'll find quick action buttons for common tasks:

| Action | Description |
|--------|-------------|
| **Add Emergency Call** | Quickly log a new emergency |
| **Add Maintenance** | Create a new maintenance record |
| **Add Job** | Schedule a new job |
| **View Compliance** | Jump to the compliance page |

> 📸 *Screenshot: Quick actions bar*

---

## Additional Dashboard Views

### Analytics

Click **"Analytics"** in the sidebar to access deeper insights:

- Trends over time
- Workload distribution
- Performance metrics

> 📖 Analytics features help you understand patterns in your operations.

### Compliance Page

Click **"Compliance"** for a detailed breakdown:

- **Overdue** — Inspections past their expiration date
- **Expiring Soon** — Inspections expiring within 30 days
- **Missing** — Units with no inspection on record

Each section lists affected units with links to take action.

> 📸 *Screenshot: Compliance page with three sections*

### Alerts Page

Click **"Alerts"** to see all items requiring attention:

| Alert Type | Severity | Description |
|------------|----------|-------------|
| Inspection overdue | High | Inspection has expired |
| Inspection expiring soon | Medium | Expiring within 30 days |
| Inspection missing | High | No inspection recorded |
| Emergency call open | High | Unresolved emergency |
| Maintenance open | Medium | Pending maintenance |

Alerts are color-coded by severity and link directly to the relevant record.

> 📸 *Screenshot: Alerts page with severity indicators*

---

## Dashboard Tips

### Refresh Data

The dashboard loads fresh data each time you visit. For real-time updates, refresh your browser.

### Mobile Access

The dashboard is responsive and works on tablets and phones, though the full desktop view provides the best experience.

### Permissions

All users can view the dashboard. The data shown is for your entire workspace, not filtered by user.

---

## Understanding Your Numbers

### Good Signs

- **High compliance rate (95%+)** — Your inspection tracking is working
- **Zero units at risk** — All units have valid inspections
- **Low emergency count** — Emergencies are being resolved quickly

### Warning Signs

- **Declining compliance forecast** — Many inspections expiring soon
- **Growing emergency queue** — Emergencies not being resolved
- **Rising at-risk count** — Units falling out of compliance

---

## Next Steps

From the dashboard, you can:

- [View Compliance Details](./operations/inspections.md) — Take action on expiring inspections
- [Manage Emergency Calls](./emergency.md) — Resolve open emergencies
- [Schedule Jobs](./operations/jobs.md) — Create work orders for your team

---

*The dashboard is designed to give you everything you need at a glance. Check it daily to stay on top of your operations.*
