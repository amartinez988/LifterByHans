# Management Companies

Management Companies represent the property management firms, building owners, or organizations that contract your elevator services. They are the top level of your asset hierarchy.

---

## Understanding the Hierarchy

```
Management Company
    └── Building(s)
            └── Unit(s) (Elevators/Escalators)
```

Each management company can have multiple buildings, and each building can have multiple elevator or escalator units.

---

## Accessing Management Companies

1. Click **"Companies"** under the **Assets** section in the sidebar
2. You'll see a list of all management companies in your workspace

> 📸 *Screenshot: Management companies list view*

---

## Viewing the Company List

### List Features

| Feature | Description |
|---------|-------------|
| **Search** | Type to filter companies by name, account number, or notes |
| **Archive Filter** | Toggle between active, archived, or all companies |
| **Company Cards** | Click any company to view details |

### Company Card Information

Each company card displays:
- **Company name**
- **Account number** (if set)
- **Archive status** (badge shown if archived)

> 📸 *Screenshot: Company list with search and filter controls*

---

## Creating a Management Company

### Step-by-Step Instructions

1. Navigate to **Companies** in the sidebar
2. Click **"Add management company"** button (top right)
3. Fill in the company form
4. Click **"Create company"**

> 📸 *Screenshot: New company form*

### Company Form Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **Name** | Yes | The official company name | "Acme Property Management" |
| **Account Number** | No | Your internal account/customer ID | "ACME-001" |
| **Website** | No | Company website URL | "https://acmeproperties.com" |
| **Main Phone** | No | Primary contact number | "(555) 123-4567" |
| **Emergency Phone** | No | After-hours contact number | "(555) 123-4568" |
| **Notes** | No | Internal notes about this company | "Preferred contact is John in facilities" |

> 💡 **Tip:** The account number is useful for matching records if you import data from another system.

---

## Viewing Company Details

### Accessing the Detail Page

1. Click on any company in the list
2. You'll see the company's full information and related records

> 📸 *Screenshot: Company detail page*

### Detail Page Sections

#### Company Information

Displays all the fields from the form (name, account number, phones, etc.)

#### Related Buildings

Shows all buildings associated with this management company with quick links.

#### Actions

- **Edit** — Update company information
- **Add Building** — Create a new building for this company
- **Archive/Restore** — Archive or restore the company
- **Delete** — Permanently remove (if no related records exist)

---

## Editing a Management Company

### Step-by-Step Instructions

1. Open the company detail page
2. Update any fields in the form
3. Click **"Save changes"**

> 💡 **Note:** All changes are saved immediately. There's no separate "edit mode."

---

## Adding Buildings to a Company

From the company detail page:

1. Click **"Add building"** button
2. Fill in the building form
3. Click **"Create building"**

Buildings are always associated with a management company. You cannot create a building without selecting or being in a company first.

> 📖 See [Buildings](./buildings.md) for detailed building management instructions.

---

## Archiving a Management Company

Archiving hides a company from the default list view without deleting data.

### When to Archive

- Customer relationship ended
- Company was acquired or renamed
- No longer providing service

### How to Archive

1. Open the company detail page
2. Click the **⋮** (three dots) menu button
3. Select **"Archive"**
4. Confirm the action

### Viewing Archived Companies

1. On the Companies list page
2. Click the **filter dropdown** (shows "Active" by default)
3. Select **"Archived"** or **"All"**

> 📸 *Screenshot: Archive filter dropdown*

---

## Restoring an Archived Company

1. View archived companies using the filter
2. Open the archived company
3. Click the **⋮** menu button
4. Select **"Restore"**

The company will reappear in the active list.

---

## Deleting a Management Company

### Prerequisites

A company can only be deleted if it has:
- No buildings
- No contacts
- No related operational records (maintenance, inspections, etc.)

### How to Delete

1. Open the company detail page
2. Click the **⋮** menu button
3. Select **"Delete"**
4. Confirm the permanent deletion

> ⚠️ **Warning:** Deletion is permanent and cannot be undone. Archive companies instead if you want to preserve history.

---

## Searching and Filtering

### Search

The search box filters companies by:
- Company name
- Account number
- Website
- Notes content

Type any text to instantly filter the list.

### Archive Filter Options

| Option | Shows |
|--------|-------|
| **Active** | Only non-archived companies |
| **Archived** | Only archived companies |
| **All** | Both active and archived |

---

## Best Practices

### Naming Conventions

- Use official company names for clarity
- Be consistent with abbreviations (Inc., LLC, etc.)
- Include location if you have multiple customers with similar names

### Account Numbers

- Match your accounting/billing system IDs
- Useful for data imports and exports
- Keep a consistent format (e.g., "CUST-001")

### Emergency Contacts

- Always include an emergency phone when available
- Document after-hours procedures in the notes
- Keep contacts up to date

### Notes

- Document key contacts and their roles
- Note any special requirements or preferences
- Include billing or invoicing details if relevant

---

## Permissions

| Role | Can View | Can Create | Can Edit | Can Archive | Can Delete |
|------|----------|------------|----------|-------------|------------|
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Member** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Related Features

- [Buildings](./buildings.md) — Add buildings under companies
- [Contacts](../people/contacts.md) — Add contact people for companies
- [Data Import](../settings/import.md) — Bulk import companies via CSV

---

*Management companies are the foundation of your asset hierarchy. Set them up first before adding buildings and units.*
