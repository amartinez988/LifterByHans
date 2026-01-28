# AGENT HANDOFF – LIFTER MVP

This document is the **single source of truth** for any AI agent or human developer continuing work on the LIFTER project.

If you are an AI agent (Claude, Codex, GPT, etc.): **read this entire document before writing or modifying any code**.

---

## 1. Project Overview

**LIFTER** is a multi-tenant SaaS application for **Elevator & Escalator service companies** to manage:
- Companies / workspaces
- Team members & roles
- Management companies
- Contacts & contact categories
- Buildings
- Units (elevators / escalators)
- Maintenance, inspections, compliance, alerts

The product is built incrementally in **phases**. We are currently at **Phase 7**.

This project prioritizes:
- Correct multi-tenant isolation
- Predictable deployments
- Simplicity over premature optimization

---

## 2. Tech Stack (DO NOT CHANGE)

### Core
- **Next.js 14** (App Router)
- **TypeScript** (strict)
- **Prisma ORM**
- **PostgreSQL (Supabase)**
- **Auth.js / NextAuth (Credentials provider)**
- **Vercel** (deployment)

### Database
- Supabase Postgres
- Uses **Session Pooler** for production (IPv4 compatible)
- Prisma migrations handled locally

### Styling / UI
- Tailwind CSS
- Simple server components + forms

---

## 3. Repository Structure (Important)

```
app/
  (auth)/        → login / signup routes
  (app)/app/     → ALL authenticated app routes
  api/           → API routes (auth, invites, etc)

lib/
  db.ts          → Prisma client (exports `db`)

prisma/
  schema.prisma  → Database schema

AGENT_HANDOFF.md (this file)
PHASES.md        → What has been built phase by phase
```

### Critical rule
- **All authenticated routes live under `app/(app)/app/*`**
- These routes are tenant-scoped and must not be statically generated

---

## 4. Build & Deployment (CRITICAL – DO NOT BREAK)

### Build command
**This must always be true**:

```json
"build": "prisma generate && next build"
```

Reason:
- Vercel does NOT run `prisma generate` automatically
- Prisma client must exist before `next build`

### Deployment platform
- Vercel
- Auto-deploys from GitHub

### Node version
- Node 20 (pinned via `.nvmrc`)

---

## 5. Environment Variables (Exact names matter)

### REQUIRED (Production & Preview)

```
DATABASE_URL=postgresql://... (SESSION POOLER, encoded password, sslmode=require)
DIRECT_URL=postgresql://... (DIRECT connection, for migrations only)

AUTH_SECRET=<long random string>
NEXTAUTH_SECRET=<same value as AUTH_SECRET>

AUTH_URL=https://<production-domain>
NEXTAUTH_URL=https://<production-domain>

NEXT_PUBLIC_APP_URL=https://<production-domain>
```

### Notes
- Password **must be URL-encoded** (`@` → `%40`, `!` → `%21`)
- DATABASE_URL uses **Supabase Session Pooler**
- DIRECT_URL is NOT required on Vercel (used locally)

---

## 6. Authentication Model

- Auth.js / NextAuth (Credentials)
- Prisma adapter
- Email + password
- Passwords hashed with bcrypt

### Roles
- OWNER (created automatically on company creation)
- ADMIN
- MEMBER

### Rules
- OWNER role cannot be assigned via UI
- OWNER cannot be downgraded
- Role enum enforcement is strict (TypeScript + DB)

---

## 7. Multi-Tenant Model (Very Important)

### Core principle
Every record belongs to a **Company (Workspace)**.

- Users belong to companies via `CompanyMember`
- All domain data is scoped to `companyId`

**Never query data without filtering by companyId.**

---

## 8. Prisma Client Usage

### Location
- Prisma client is defined in `lib/db.ts`

```ts
export const db = global.prisma || new PrismaClient(...)
```

### Rules
- Never create new PrismaClient instances elsewhere
- Never run DB queries at module import time
- DB access must occur inside:
  - server actions
  - route handlers
  - server components

---

## 9. Rendering Strategy (VERY IMPORTANT)

All authenticated routes are **dynamic**.

In:
```
app/(app)/app/layout.tsx
```

We enforce:
```ts
export const dynamic = "force-dynamic";
export const revalidate = 0;
```

Reason:
- Prevents Next.js from executing Prisma during build
- Avoids "Failed to collect page data" errors

---

## 10. Invitations & Team Management

- Invite links (token-based)
- Invites stored in `CompanyInvite`
- Roles assigned on acceptance
- Owner creates invites

---

## 11. What NOT to Do (Hard Rules)

❌ Do NOT rename env vars
❌ Do NOT change Prisma schema without migration
❌ Do NOT refactor folder structure
❌ Do NOT introduce static generation for app routes
❌ Do NOT "clean up" auth logic
❌ Do NOT change build command

---

## 12. Development Workflow

1. Make change
2. Run `npm run build` locally
3. If build passes → commit
4. Push to GitHub
5. Let Vercel deploy

Local build = truth.

---

## 13. Current Status

- Phase 1 → Phase 7 implemented
- App builds locally and on Vercel
- Supabase connectivity verified
- Auth configuration stabilized

Refer to `PHASES.md` for full phase history.

---

## 14. If You Are an AI Agent

You are expected to:
- Follow this document strictly
- Ask before changing architecture
- Prefer incremental changes
- Preserve existing behavior

Failure to follow these rules **will break production**.

---

END OF AGENT HANDOFF

