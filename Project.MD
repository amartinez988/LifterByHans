# LIFTER — Product Requirements Document (PRD)
## MVP Phase 1: Landing, Authentication, Company Onboarding

---

## 1. Objective

Build the foundational MVP of **LIFTER**, a vertical SaaS for Elevator & Escalator service companies.

Phase 1 focuses exclusively on:
- Public landing page
- User authentication (email + password)
- Company workspace creation (onboarding step 1)
- Minimal authenticated app shell

This phase validates:
- Account creation
- Secure authentication
- Multi-tenant architecture (user ↔ company)
- Onboarding flow correctness

No business features (units, buildings, inspections, etc.) are included in this phase.

---

## 2. In Scope (Phase 1)

### ✅ Included
1. Public landing page
2. User sign up (email, name, password)
3. User log in / log out
4. Company workspace creation
5. Routing guards based on auth + onboarding state
6. Minimal dashboard after onboarding

### ❌ Explicitly Excluded
- Buildings
- Units / elevators
- Maintenance / inspections
- Invitations
- Roles beyond OWNER
- Billing / payments
- Email verification
- Password reset
- OAuth / SSO
- Docker-based local DB

---

## 3. Tech Stack (Hard Requirements)

Agents MUST use this stack:

### Frontend / Full-stack
- Next.js (App Router)
- TypeScript

### UI
- Tailwind CSS
- shadcn/ui

### Forms & Validation
- React Hook Form
- Zod

### Authentication
- Auth.js (NextAuth v5)
- Credentials provider (email/password)

### Security
- bcrypt for password hashing

### Database
- PostgreSQL (managed / hosted)
  - Supabase, Neon, or Railway are acceptable

### ORM
- Prisma

### Tooling
- ESLint
- Prettier

---

## 4. Development Assumptions

- Developer machine has:
  - Node.js 20+
  - npm (or pnpm)
  - Git
- PostgreSQL is **hosted**, not local Docker
- Prisma connects via `DATABASE_URL`

---

## 5. Project Structure (Required)

Single Next.js application.

