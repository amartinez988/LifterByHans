# Data Import

The Import Wizard allows you to bulk import data from CSV files. This is especially useful when migrating from another system or setting up a new workspace with existing data.

---

## Accessing the Import Wizard

1. Click **"Settings"** > **"Workspace"** in the sidebar
2. Click **"Open Import Wizard"** on the Import Data card
3. Or navigate to `/app/settings/import`

> 📸 *Screenshot: Settings page with Import Data card*

---

## Import Order

Import data in this specific order to maintain proper relationships:

```
1. Management Companies
2. Buildings
3. Units
4. Mechanics
5. Contacts
6. Jobs
```

> ⚠️ **Important:** Each level depends on the previous. You cannot import Buildings without Management Companies, or Units without Buildings.

---

## Import Wizard Interface

The Import Wizard has tabs for each data type:

| Tab | What It Imports |
|-----|-----------------|
| **1. Companies** | Management Companies |
| **2. Buildings** | Buildings (linked to Companies) |
| **3. Units** | Units (linked to Buildings) |
| **4. Mechanics** | Mechanic records |
| **5. Contacts** | Contacts (linked to Companies) |
| **6. Jobs** | Scheduled Jobs |

> 📸 *Screenshot: Import Wizard with tabs*

---

## Current Data Summary

At the bottom of the Import page, you'll see your existing data counts:

| Category | Description |
|----------|-------------|
| **Companies** | Existing management companies |
| **Buildings** | Existing buildings |
| **Units** | Existing units |
| **Mechanics** | Existing mechanics |
| **Contacts** | Existing contacts |
| **Lookups** | Total lookup values configured |

Use this to verify your import worked.

---

## General Import Process

For each data type, the process is:

1. **Download Template** — Get the CSV template with correct columns
2. **Fill In Data** — Add your data to the template
3. **Upload CSV** — Upload the completed file
4. **Review** — Check the preview for errors
5. **Confirm Import** — Execute the import

---

## Importing Management Companies

### Template Columns

| Column | Required | Description |
|--------|----------|-------------|
| name | Yes | Company name |
| accountNumber | No | Your account ID |
| website | No | Company website |
| mainPhone | No | Primary phone |
| emergencyPhone | No | After-hours phone |
| notes | No | Additional notes |

### Steps

1. Click the **"Companies"** tab
2. Click **"Download Template"**
3. Fill in your data
4. Click **"Upload CSV"** and select your file
5. Review the preview
6. Click **"Import"**

---

## Importing Buildings

### Prerequisites

- Management Companies must exist
- Reference companies by exact name

### Template Columns

| Column | Required | Description |
|--------|----------|-------------|
| managementCompanyName | Yes | Matching company name |
| name | Yes | Building name |
| address | Yes | Full address |
| localPhone | No | Building phone |
| jurisdiction | No | Regulatory zone |
| notes | No | Additional notes |

### Steps

1. Click the **"Buildings"** tab
2. Download the template
3. Use exact management company names
4. Upload and review
5. Import

---

## Importing Units

### Prerequisites

- Buildings must exist
- Reference buildings by exact name
- Configure lookup values (categories, statuses, etc.)

### Template Columns

| Column | Required | Description |
|--------|----------|-------------|
| managementCompanyName | Yes | Matching company name |
| buildingName | Yes | Matching building name |
| identifier | Yes | Unit ID (e.g., "E-1") |
| category | Yes | Unit category name |
| status | Yes | Unit status name |
| equipmentType | Yes | Equipment type name |
| brand | Yes | Brand name |
| description | No | Unit description |
| serialNumber | No | Manufacturer serial |
| underContract | No | true/false |
| isActive | No | true/false (default true) |
| agreementStartDate | No | YYYY-MM-DD format |
| agreementEndDate | No | YYYY-MM-DD format |
| phoneLineService | No | true/false |
| landings | No | Number of landings |
| capacity | No | Weight capacity |
| floorLocation | No | Floor number |
| machineRoomLocation | No | Location description |
| buildingNumber | No | Building's internal ID |
| notes | No | Additional notes |

### Lookup Values

The import will:
- Match existing lookup values by name
- Create new lookup values if they don't exist

Ensure consistent naming!

---

## Importing Mechanics

### Template Columns

| Column | Required | Description |
|--------|----------|-------------|
| firstName | Yes | First name |
| lastName | Yes | Last name |
| email | No | Email address |
| phone | No | Phone number |
| level | No | Mechanic level name |
| isActive | No | true/false (default true) |

### Steps

1. Click the **"Mechanics"** tab
2. Download template
3. Fill in mechanic data
4. Upload and import

---

## Importing Contacts

### Prerequisites

- Management Companies must exist
- Contact Categories must be configured

### Template Columns

| Column | Required | Description |
|--------|----------|-------------|
| managementCompanyName | Yes | Matching company name |
| category | Yes | Contact category name |
| firstName | Yes | First name |
| lastName | Yes | Last name |
| email | No | Email address |
| phone | No | Phone number |
| isPrimary | No | true/false |
| notes | No | Additional notes |

---

## Importing Jobs

### Prerequisites

- Management Companies, Buildings, and optionally Units must exist
- Mechanics should be imported if assigning jobs

### Template Columns

| Column | Required | Description |
|--------|----------|-------------|
| title | Yes | Job title |
| managementCompanyName | Yes | Matching company name |
| buildingName | Yes | Matching building name |
| unitIdentifier | No | Matching unit ID |
| mechanicFirstName | No | Mechanic first name |
| mechanicLastName | No | Mechanic last name |
| scheduledDate | Yes | YYYY-MM-DD format |
| scheduledStartTime | No | HH:MM format |
| scheduledEndTime | No | HH:MM format |
| status | No | SCHEDULED, EN_ROUTE, etc. |
| priority | No | LOW, NORMAL, HIGH, URGENT |
| jobType | No | MAINTENANCE, INSPECTION, etc. |
| description | No | Job description |
| notes | No | Internal notes |

---

## CSV Format Guidelines

### General Rules

- Use comma-separated values (CSV)
- First row must be column headers
- UTF-8 encoding recommended
- Dates: YYYY-MM-DD format
- Times: HH:MM (24-hour) format
- Boolean: true/false (lowercase)

### Handling Special Characters

- Wrap text with commas in quotes
- Example: `"Acme Properties, Inc."`
- Use double quotes to escape quotes

### Example CSV

```csv
name,accountNumber,mainPhone,notes
"Acme Properties",ACME-001,(555) 123-4567,Great customer
"Best Buildings LLC",BEST-002,(555) 234-5678,
```

---

## Troubleshooting

### "Company not found"

- Check spelling exactly matches existing company
- Import companies first
- Case sensitivity may matter

### "Building not found"

- Check both company AND building names
- Import buildings before units
- Verify the building belongs to the correct company

### "Invalid lookup value"

- Check the lookup value exists
- Match exact spelling
- The import may create new values automatically

### Duplicate Entries

- The import checks for duplicates by key fields
- Duplicates are skipped or flagged
- Review the preview carefully

### Date Format Errors

- Use YYYY-MM-DD format
- Example: 2024-01-15
- Don't use MM/DD/YYYY

---

## Best Practices

### Prepare Your Data

1. Clean up your source data first
2. Standardize naming conventions
3. Remove duplicates
4. Verify relationships (companies → buildings → units)

### Test First

1. Export a small sample (5-10 records)
2. Run a test import
3. Verify results
4. Then import the full dataset

### Backup Existing Data

If importing into a workspace with existing data:
1. Note what you have
2. Export if possible
3. Test carefully

### Lookup Values First

1. Set up lookup values before importing
2. Or let import create them
3. Review and clean up after

### Sequential Order

Always follow the import order:
1. Companies → Buildings → Units
2. Mechanics (can be parallel)
3. Contacts (need companies)
4. Jobs (need everything)

---

## After Importing

### Verify Your Data

1. Check the Current Data Summary
2. Navigate to each section
3. Spot-check records
4. Verify relationships

### Clean Up

1. Review auto-created lookup values
2. Merge duplicates if any
3. Fill in missing optional fields
4. Archive incorrect imports

---

## Permissions

Only Owners and Admins can access the Import Wizard.

| Action | Owner | Admin | Member |
|--------|-------|-------|--------|
| Access import | ✅ | ✅ | ❌ |
| Import data | ✅ | ✅ | ❌ |
| Download templates | ✅ | ✅ | ❌ |

---

## Related Features

- [Lookup Values](./lookup-values.md) — Configure dropdown options before import
- [Management Companies](../assets/companies.md) — Company records
- [Buildings](../assets/buildings.md) — Building records
- [Units](../assets/units.md) — Unit records
- [Mechanics](../people/mechanics.md) — Mechanic records
- [Contacts](../people/contacts.md) — Contact records
- [Jobs](../operations/jobs.md) — Job records

---

*The Import Wizard saves hours of manual data entry. Prepare your data carefully and import in order for best results.*

