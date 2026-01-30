# LIFTER MVP

Phase 1 covers landing, authentication, and company onboarding. Phase 2 adds team roles and invite links for multi-user workspaces. Phase 3 adds management companies, contacts, and contact categories. Phase 4 adds buildings, units, and unit lookups. Phase 5 adds mechanics and maintenance tracking. Phase 6 adds inspectors, inspections, and emergency calls. Phase 7 adds operational dashboards and compliance views.

## Requirements
- Node.js 20+
- PostgreSQL database (hosted)

## Setup
1. Copy `.env.example` to `.env` and fill `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, and `NEXT_PUBLIC_APP_URL`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

## Phase 2 Features
- Team management at `/app/team`
- Invite links with role assignment (ADMIN or MEMBER)
- Invite acceptance at `/invite/[token]`
- Role-protected team actions (OWNER/ADMIN only)

## Phase 3 Features
- Management companies at `/app/management-companies`
- Contacts at `/app/contacts`
- Contact categories at `/app/contact-categories`
- Inline contact creation from management companies
- Inline category creation within contact forms
- Primary contact enforcement per management company

## Phase 4 Features
- Buildings under management companies (`/app/management-companies/[id]`)
- Building detail and units list at `/app/buildings/[id]`
- Unit create/edit at `/app/units/[id]`
- Unit lookup tables with inline creation on unit forms

## Phase 5 Features
- Mechanics at `/app/mechanics`
- Maintenance records at `/app/maintenance`
- Filtered selections (company → building → unit)
- Auto-generated maintenance codes per workspace
- Mechanic levels as a lookup table with inline creation

## Phase 6 Features
- Inspectors at `/app/inspectors`
- Inspections at `/app/inspections` with inline status/result/inspector creation
- Emergency calls at `/app/emergency-calls` with inline status creation
- Inspection and emergency code generation per workspace

## Phase 7 Features
- Operational dashboard at `/app`
- Compliance view at `/app/compliance`
- Alerts view at `/app/alerts`
- Derived inspection compliance, emergency, and maintenance statuses

## Phase 10 Features (Overnight Enhancements - Jan 2026)

### Analytics Dashboard
- Business intelligence at `/app/analytics`
- Key metrics: jobs completed, maintenance, emergency response time
- Activity trend chart (last 30 days)
- Mechanic performance chart
- Job status and priority distribution charts

### Customer Portal
- Public portal for building managers at `/portal/[token]`
- View unit compliance status
- View service history and upcoming inspections
- Track open maintenance and emergency calls
- Portal link management from management company pages
- Automatic email notification when portal link is generated

### Email Templates
- Professional email templates using @react-email/components
- Templates for:
  - Inspection reminders (30/14/7 days before expiration)
  - Job status updates
  - Emergency call alerts
  - Weekly summary reports

### Marketing Plan
- Comprehensive marketing strategy in MARKETING-PLAN.md
- Target customer segments defined
- Pricing strategy recommendations
- Go-to-market channels identified
- Outreach messaging and templates
