# Units (Elevators & Escalators)

Units are the individual pieces of equipment you service — elevators, escalators, lifts, and other vertical transportation equipment. This is where you track technical specifications, inspections, maintenance history, and more.

---

## Understanding the Hierarchy

```
Management Company
    └── Building
            └── Unit ← You are here
```

Units are the core records in Uplio. All operational activities (maintenance, inspections, emergency calls, jobs) are linked to units.

---

## Accessing Units

### From the Sidebar

1. Click **"Units"** under the **Assets** section
2. You'll see a list of all units across all buildings

### From a Building

1. Open a building detail page
2. View units listed within that building
3. Click "Add unit" to create new units

> 📸 *Screenshot: Units list view with filters*

---

## Viewing the Units List

### List Features

| Feature | Description |
|---------|-------------|
| **Search** | Filter by identifier, description, serial number, or notes |
| **Archive Filter** | Toggle between active, archived, or all units |
| **Unit Cards** | Click any unit to view full details |

### Unit Card Information

Each unit card displays:
- **Unit identifier** (e.g., "E-1", "ELEV-101")
- **Building name and address**
- **Category badge** (Passenger, Freight, Escalator, etc.)
- **Status badge** (Operational, Out of Service, etc.)
- **Brand** (if set)
- **Contract status** (Under Contract badge if applicable)
- **Active/Inactive status**

> 📸 *Screenshot: Unit cards with all badge types*

---

## Creating a Unit

Units must be created from within a building.

### Step-by-Step Instructions

1. Navigate to a **Building** detail page
2. Click **"Add unit"** button
3. Fill in the unit form (see field descriptions below)
4. Click **"Create unit"**

> 📸 *Screenshot: New unit form - top section*

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Unit Identifier** | Unique ID for this unit within the building | "E-1", "ELEV-101" |
| **Category** | Type of equipment | Passenger, Freight, Escalator |
| **Status** | Operational state | Operational, Under Repair |
| **Equipment Type** | Technical classification | Traction, Hydraulic, MRL |
| **Brand** | Manufacturer | Otis, KONE, Schindler |

### Optional Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Description** | Additional details about the unit | "Main lobby elevator bank - left car" |
| **Serial Number** | Manufacturer's serial number | "SN-12345678" |
| **Building Number** | Building's internal unit number | "E1" |
| **Under Contract** | Whether unit is under service agreement | ✅ Yes / ❌ No |
| **Active** | Whether unit is actively serviced | ✅ Yes / ❌ No |
| **Agreement Start Date** | Contract start date | 2024-01-01 |
| **Agreement End Date** | Contract end date | 2025-12-31 |
| **Phone Line Service** | Whether phone monitoring is active | ✅ Yes / ❌ No |
| **Folder URL** | Link to external documentation folder | Google Drive link |
| **Certificate URL** | Link to inspection certificate | URL |
| **Photo URL** | Link to unit photo | URL |
| **Landings** | Number of floors served | 12 |
| **Capacity** | Weight capacity (typically lbs) | 2500 |
| **Floor Location** | What floor the unit is on | 1 |
| **Machine Room Location** | Where to find the machine room | "Roof level" |
| **Notes** | Internal notes | "Callback issues - check leveling" |

> 📸 *Screenshot: Unit form - all fields*

---

## Lookup Values

Several fields use configurable dropdown values:

| Field | Lookup Type | Examples |
|-------|-------------|----------|
| **Category** | Unit Categories | Passenger, Freight, Escalator, Dumbwaiter, Wheelchair Lift |
| **Status** | Unit Statuses | Operational, Out of Service, Under Repair, Modernization |
| **Equipment Type** | Equipment Types | Traction, Hydraulic, MRL (Machine Room Less) |
| **Brand** | Brands | Otis, KONE, Schindler, ThyssenKrupp, Fujitec |

### Adding New Lookup Values

While creating or editing a unit:
1. Click **"+ Create new [category/status/equipment/brand]"**
2. Enter the name and optional description
3. Click **"Create"**
4. The new value is automatically selected

> 📖 See [Lookup Values](../settings/lookup-values.md) for more on managing dropdowns.

---

## Viewing Unit Details

### Accessing the Detail Page

Click any unit from the list or building page.

> 📸 *Screenshot: Unit detail page overview*

### Detail Page Sections

#### 1. Header

- Unit identifier
- Building name and address (breadcrumb)
- Archive status badge
- Action menu (⋮)

#### 2. QR Code Section

Generate and download QR codes for this unit. See [QR Codes](#qr-codes-and-public-pages) below.

#### 3. Documents Section

Upload and manage documents related to this unit:
- Certificates
- Inspection reports
- Maintenance records
- Manuals
- Schematics
- Photos

#### 4. Location & Unit Info

Quick reference showing:
- Management company (linked)
- Building (linked)
- Address
- Category, status, brand
- Active and contract status

#### 5. Edit Details Form

Full form to update all unit information.

#### 6. Service Timeline

Chronological history showing:
- **Inspections** — Date, result (passed/failed), inspector
- **Maintenance** — Date, status, mechanic
- **Emergency Calls** — Date, status, description

> 📸 *Screenshot: Service timeline section*

---

## QR Codes and Public Pages

Each unit has a unique QR code and public information page.

### What is the Public Page?

A mobile-friendly page that anyone can access by scanning the QR code. It shows:
- Unit identifier and status
- Building name and address
- Compliance status (valid inspection or not)
- Equipment details
- Recent service activity
- **Issue report form** — Visitors can report problems

> 📸 *Screenshot: Public unit page on mobile*

### Generating QR Codes

1. Open the unit detail page
2. Find the **QR Code** section
3. Click **"Show QR Code"**

### QR Code Actions

| Action | Description |
|--------|-------------|
| **Copy Link** | Copy the public page URL to clipboard |
| **Download PNG** | Download a high-resolution PNG image |
| **Preview** | Open the public page in a new tab |

### Printing QR Codes

1. Download the PNG image
2. Print and laminate for durability
3. Attach to:
   - Inside the elevator car
   - Machine room door
   - Control panel
   - Building directory

> 💡 **Tip:** Place QR codes where building occupants can easily scan them to report issues.

---

## Issue Reports from QR Codes

When someone scans the QR code and reports an issue:

1. They select an issue type (stuck, noise, door problem, etc.)
2. They can add a description
3. They can optionally provide contact info
4. The report appears in your **Issue Reports** list

> 📖 See [Issue Reports](../operations/issue-reports.md) for managing incoming reports.

---

## Document Management

### Uploading Documents

1. Open the unit detail page
2. Find the **Documents** section
3. Click **"Upload Document"** or drag and drop files
4. Select the document type
5. Add a title and optional description

### Document Types

| Type | Use For |
|------|---------|
| **Certificate** | Inspection certificates, permits |
| **Inspection Report** | Detailed inspection reports |
| **Maintenance Report** | Service records |
| **Manual** | Equipment manuals |
| **Schematic** | Wiring diagrams, blueprints |
| **Photo** | Equipment photos |
| **Contract** | Service agreements |
| **Invoice** | Billing records |
| **Other** | Miscellaneous documents |

### Viewing and Downloading

Click any document to download or view it.

### Deleting Documents

1. Find the document in the list
2. Click the delete icon
3. Confirm deletion

---

## Editing a Unit

### Step-by-Step Instructions

1. Open the unit detail page
2. Scroll to the **Edit Details** section
3. Update any fields
4. Click **"Save unit"**

> 💡 **Note:** Changes are not automatically saved. You must click the save button.

---

## Archiving a Unit

Archiving hides a unit from the default view without deleting data.

### When to Archive

- Equipment was removed or decommissioned
- Building no longer serviced
- Unit replaced with new equipment

### How to Archive

1. Open the unit detail page
2. Click the **⋮** menu button
3. Select **"Archive"**
4. Confirm the action

### Viewing Archived Units

1. On the Units list page
2. Click the **filter dropdown**
3. Select **"Archived"** or **"All"**

---

## Restoring an Archived Unit

1. View archived units using the filter
2. Open the archived unit
3. Click the **⋮** menu button
4. Select **"Restore"**

---

## Deleting a Unit

### Prerequisites

A unit can only be deleted if it has:
- No maintenance records
- No inspections
- No emergency calls
- No scheduled jobs
- No issue reports
- No documents

### How to Delete

1. Open the unit detail page
2. Click the **⋮** menu button
3. Select **"Delete"** (grayed out if records exist)
4. Confirm the permanent deletion

> ⚠️ **Warning:** Deletion is permanent. Archive units to preserve history.

---

## Best Practices

### Unit Identifiers

- Use consistent naming conventions
- Make them unique within each building
- Examples: "E-1", "ELEV-A", "ESC-1", "LIFT-LOBBY-1"

### Categories and Statuses

- Set up lookup values before adding units
- Use consistent terminology across your organization
- Examples of categories: Passenger, Freight, Escalator, Wheelchair Lift

### Contract Tracking

- Keep agreement dates up to date
- Use the "Under Contract" checkbox for quick filtering
- Set reminders for contract renewals

### Documentation

- Upload certificates immediately after inspections
- Keep manuals attached for technician reference
- Store schematics for complex equipment

### QR Code Placement

- Install in visible, accessible locations
- Protect from weather/wear with lamination
- Replace if QR code becomes damaged or unreadable

---

## Permissions

| Role | Can View | Can Create | Can Edit | Can Archive | Can Delete |
|------|----------|------------|----------|-------------|------------|
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Member** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Related Features

- [Buildings](./buildings.md) — Parent level for units
- [Inspections](../operations/inspections.md) — Track inspection compliance
- [Maintenance](../operations/maintenance.md) — Schedule regular maintenance
- [Issue Reports](../operations/issue-reports.md) — Manage QR code reports
- [Lookup Values](../settings/lookup-values.md) — Configure dropdown options

---

*Units are the heart of Uplio. Keep them well-documented and up to date for smooth operations and happy customers.*

