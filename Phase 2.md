# LIFTER — Product Requirements Document (PRD)
## MVP Phase 2: Team Invitations (Invite Links)

---

## 1. Objective

Phase 2 extends LIFTER from a **single-owner workspace** into a **multi-user company workspace**.

The goal is to allow an OWNER (or ADMIN) to invite other users into their company using **secure invite links**, without implementing email delivery.

This phase focuses on:
- Team management
- Role-based access
- Secure invite acceptance flow

No elevator-specific business logic is included in this phase.

---

## 2. In Scope (Phase 2)

### ✅ Included
1. Company team management page
2. Invite team members via invite links
3. Accept invite flow (authenticated)
4. Role assignment (OWNER / ADMIN / MEMBER)
5. Pending invite management
6. Access control for team actions
7. Wiring the existing “Invite your team” section to real functionality

### ❌ Explicitly Excluded
- Email sending
- Password resets
- External identity providers
- Technician-specific permissions
- Audit logs
- Notifications

---

## 3. Tech Stack (Unchanged)

Same stack as Phase 1. No changes allowed.

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- Auth.js (NextAuth v5)
- PostgreSQL (Supabase)
- Prisma ORM

---

## 4. Data Model Changes (Required)

### 4.1 Update `CompanyMember`

Expand the `role` field to support:

- `OWNER`
- `ADMIN`
- `MEMBER`

> OWNER is assigned during Phase 1 and cannot be downgraded or removed in Phase 2.

---

### 4.2 New Table: `CompanyInvite`

Add a new table to support invite links.

#### CompanyInvite
- `id` (uuid, primary key)
- `companyId` (uuid, FK → Company)
- `email` (string)
- `role` (enum/string: ADMIN | MEMBER)
- `token` (string, unique, long random)
- `expiresAt` (timestamp)
- `acceptedAt` (timestamp, nullable)
- `createdByUserId` (uuid, FK → User)
- `createdAt` (timestamp)

Constraints:
- `token` must be unique
- An invite can only be accepted once
- Expired invites cannot be accepted

---

## 5. Authorization Rules

### Team Management
- Only `OWNER` or `ADMIN` can:
  - Create invites
  - View pending invites
  - Remove members
  - Change member roles (except OWNER)

### Regular Members
- `MEMBER`:
  - Can access `/app`
  - Cannot manage team or invites

---

## 6. UX / Routing

### 6.1 Team Management Page

**Route**


**Sections**
1. Current Members
   - Name
   - Email
   - Role
2. Pending Invites
   - Email
   - Role
   - Status (Pending / Accepted / Expired)
3. Invite New Member
   - Email input
   - Role selector (ADMIN or MEMBER)
   - “Create invite” button

---

### 6.2 Update Existing UI Entry Point

The existing section:


Must be updated to:
- Link to `/app/team`
- Display active functionality instead of placeholder text

---

## 7. Invite Flow (Core Feature)

### 7.1 Creating an Invite

- Owner/Admin submits:
  - Email
  - Role
- Server generates:
  - Secure random token
  - Expiration (e.g. 7 days)
- Save record in `CompanyInvite`
- UI displays:
  - Invite link
  - Copy-to-clipboard button

Example invite URL:

---

### 7.2 Accepting an Invite

**Route**

Behavior:
1. Validate token:
   - Exists
   - Not expired
   - Not already accepted
2. If user is NOT authenticated:
   - Redirect to login/signup
   - After auth, return to invite
3. If user is authenticated:
   - Create `CompanyMember` with role from invite
   - Mark invite as accepted
   - Redirect to `/app`

Edge cases:
- If user already belongs to the company → show message and redirect
- If invite is invalid/expired → show error page

---

## 8. Server Logic Requirements

- Invite creation must be server-side
- Invite acceptance must be server-side
- Token generation must be cryptographically secure
- Validation must occur on every invite redemption

Agents may use:
- Next.js Route Handlers
- OR Server Actions

---

## 9. Security Requirements

- Invite tokens:
  - Long random strings
  - Non-guessable
- Invites:
  - One-time use
  - Expire automatically
- Role enforcement must be server-side
- Users cannot escalate their own role
- OWNER role cannot be removed or reassigned

---

## 10. Acceptance Criteria

Phase 2 is complete when:

1. OWNER/ADMIN can open `/app/team`
2. OWNER/ADMIN can create an invite
3. Invite link is generated and copyable
4. Invite link can be redeemed by a new or existing user
5. Redeeming invite creates a CompanyMember
6. Invite cannot be reused
7. Expired invites are rejected
8. Team list shows active members
9. Pending invites are visible
10. MEMBERS cannot access team management

---

## 11. Deliverables

- Prisma migration for:
  - `CompanyInvite`
  - Updated `CompanyMember.role`
- Team management UI
- Invite creation flow
- Invite acceptance flow
- Updated dashboard “Invite your team” section
- README update describing Phase 2

---

## 12. Non-Goals (Phase 2)

- Email delivery
- External auth providers
- Advanced permissions
- Activity logs
- Notifications
- Billing enforcement

---

## End of PRD — Phase 2
