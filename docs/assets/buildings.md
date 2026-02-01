# Buildings

Buildings represent the physical locations where your elevator and escalator units are installed. Each building belongs to a Management Company and can contain multiple units.

---

## Understanding the Hierarchy

```
Management Company
    └── Building ← You are here
            └── Unit(s) (Elevators/Escalators)
```

Buildings serve as the location container for your elevator units. They store address information and local contact details.

---

## Accessing Buildings

### From the Sidebar

1. Click **"Buildings"** under the **Assets** section
2. You'll see a list of all buildings across all management companies

### From a Management Company

1. Open a management company detail page
2. Scroll to the buildings section
3. View buildings specific to that company

![Buildings list](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/buildings-list.png)

---

## Viewing the Buildings List

### List Features

| Feature | Description |
|---------|-------------|
| **Search** | Filter by name, address, jurisdiction, or notes |
| **Archive Filter** | Toggle between active, archived, or all buildings |
| **Building Cards** | Click any building to view details |

### Building Card Information

Each building card displays:
- **Building name**
- **Street address**
- **Management company name**
- **Unit count** — Number of elevators/escalators in the building
- **Archive status** (badge shown if archived)

![Building cards](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/building-cards.png)

---

## Creating a Building

Buildings must be created from within a management company.

### Step-by-Step Instructions

1. Navigate to **Companies** in the sidebar
2. Click on a management company
3. Click **"Add building"** button
4. Fill in the building form
5. Click **"Create building"**

> 📸 *Screenshot: New building form*

### Building Form Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **Name** | Yes | Building name or identifier | "Downtown Tower" |
| **Address** | Yes | Full street address | "123 Main Street, New York, NY 10001" |
| **Local Phone** | No | Building management/superintendent phone | "(555) 111-2222" |
| **Jurisdiction** | No | Regulatory jurisdiction or zone | "NYC DOB" |
| **Notes** | No | Internal notes about access, parking, etc. | "Enter through loading dock. Superintendent in unit 1A." |

> 💡 **Tip:** Include access instructions in the notes field — your technicians will thank you!

---

## Viewing Building Details

### Accessing the Detail Page

1. Click on any building in the list
2. Or click a building from the management company page

![Building detail](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/building-detail.png)

### Detail Page Sections

#### Building Information

- Building name and address
- Management company (with link)
- Local phone number
- Jurisdiction
- Notes

#### Units in This Building

A list of all elevators and escalators in the building:
- Unit identifier
- Category (Passenger, Freight, Escalator, etc.)
- Status
- Quick actions

#### Quick Actions

- **Add Unit** — Create a new elevator/escalator in this building
- **View Units** — See all units in this building
- **Edit** — Update building information
- **Archive/Restore** — Archive or restore the building
- **Delete** — Permanently remove (if no related records)

---

## Editing a Building

### Step-by-Step Instructions

1. Open the building detail page
2. Update any fields in the form
3. Click **"Save changes"**

![Building edit form](https://raw.githubusercontent.com/amartinez988/LifterByHans/master/docs/images/building-edit-form.png)

---

## Adding Units to a Building

From the building detail page:

1. Click **"Add unit"** button
2. Fill in the unit form (identifier, category, status, etc.)
3. Click **"Create unit"**

Units are always associated with a building. The building determines the management company relationship automatically.

> 📖 See [Units](./units.md) for detailed unit management instructions.

---

## Archiving a Building

Archiving hides a building from the default view without deleting data.

### When to Archive

- Building is no longer serviced
- Building was demolished or sold
- Contract ended for this location

### How to Archive

1. Open the building detail page
2. Click the **⋮** (three dots) menu button
3. Select **"Archive"**
4. Confirm the action

> ⚠️ **Note:** Archiving a building does not automatically archive its units. Consider archiving units first if they should also be hidden.

### Viewing Archived Buildings

1. On the Buildings list page
2. Click the **filter dropdown**
3. Select **"Archived"** or **"All"**

---

## Restoring an Archived Building

1. View archived buildings using the filter
2. Open the archived building
3. Click the **⋮** menu button
4. Select **"Restore"**

---

## Deleting a Building

### Prerequisites

A building can only be deleted if it has:
- No units
- No related operational records (maintenance, inspections, jobs, etc.)

### How to Delete

1. Open the building detail page
2. Click the **⋮** menu button
3. Select **"Delete"**
4. Confirm the permanent deletion

> ⚠️ **Warning:** Deletion is permanent. Archive buildings to preserve history.

---

## Searching and Filtering

### Search Functionality

The search box filters buildings by:
- Building name
- Street address
- Jurisdiction
- Notes content

### Archive Filter Options

| Option | Shows |
|--------|-------|
| **Active** | Only non-archived buildings |
| **Archived** | Only archived buildings |
| **All** | Both active and archived |

---

## Best Practices

### Building Names

- Use consistent naming conventions
- Include distinguishing features if similar names exist
- Examples: "123 Main Tower", "Park Avenue Office Building", "Metro Station - West Wing"

### Addresses

- Include full address with city, state, and ZIP
- Use consistent formatting
- Verify address for GPS/mapping accuracy

### Local Phone

- Store the building manager or superintendent number
- Update when contacts change
- Include extension if applicable

### Jurisdiction

- Use this field for regulatory zones
- Examples: "NYC DOB", "LA CITY", "State of NJ"
- Helps filter buildings by regulatory requirements

### Notes

Document useful information for field technicians:
- **Access instructions** — Key codes, security procedures
- **Parking** — Where to park, loading dock location
- **Contacts** — Superintendent name and location
- **Special requirements** — PPE, check-in procedures

---

## Navigating the Hierarchy

### From Building to Management Company

Click the management company name (displayed as a breadcrumb or link) to navigate up.

### From Building to Units

- Scroll down to see units listed
- Click any unit to view details
- Use "Add unit" to create new units

### Breadcrumb Navigation

The breadcrumb trail shows your location:
```
Companies > Acme Properties > Downtown Tower > Unit E-1
```

Click any level to navigate.

---

## Permissions

| Role | Can View | Can Create | Can Edit | Can Archive | Can Delete |
|------|----------|------------|----------|-------------|------------|
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Member** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Related Features

- [Management Companies](./companies.md) — Parent level for buildings
- [Units](./units.md) — Elevators and escalators within buildings
- [Data Import](../settings/import.md) — Bulk import buildings via CSV

---

*Buildings connect your management companies to the actual elevator equipment. Keep addresses accurate for smooth dispatching.*


