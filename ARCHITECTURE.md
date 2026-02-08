# Architecture Overview

This document explains the high-level architecture and design decisions for the Laureate Park Cow Alert project.

The goal is clarity, simplicity, and long-term maintainability.

---

## Architectural Style

This is a **single-repo, full-stack Next.js application**.

- Frontend UI and backend logic live in the same codebase
- The backend is implemented using **Next.js Route Handlers**
- External managed services are used for data and notifications

There is no separate backend service or monorepo.

---

## Core Components

### 1. Next.js App (Vercel)

- Public pages (Home, Report, Confirmation)
- Protected admin dashboard
- Server-side API routes under `app/api/*`
- Server Actions and Server Components where appropriate

Next.js is responsible for:

- Routing
- Rendering
- API orchestration
- Input validation

---

### 2. Supabase (Postgres)

Supabase is used as a managed data layer.

Responsibilities:

- Store incident reports
- Track report status (`reported`, `acknowledged`, `resolved`)
- Optional authentication for admin/responders
- Optional storage for uploaded photos

Database schema changes are versioned using SQL migrations
stored in the `supabase/migrations/` directory.

Supabase is treated as an external service, not a separate app.

---

### 3. Twilio (SMS Notifications)

Twilio is used for outbound SMS notifications.

Responsibilities:

- Notify rangers/responders when a new report is submitted
- Optionally notify when a report is resolved

Twilio is:

- Accessed server-side only
- Never imported into client components
- Encapsulated in `lib/twilio/*`

---

## Code Organization Principles

### `app/`

- User-navigable routes
- API routes
- UI layouts and pages

### `lib/`

- Infrastructure and service helpers
- Supabase clients (client vs server)
- Twilio helpers
- Validation and auth utilities

Nothing in `lib/` should define routes or UI.

---

## Security Boundaries

- `lib/supabase/client.ts`  
  → Browser-safe, uses anon key only

- `lib/supabase/server.ts`  
  → Server-only, uses service role key  
  → Must never be imported into client components

- Twilio credentials are server-only

Environment variables are never committed to git.

---

## Design Philosophy

- Optimize for real-world usage, not hypothetical scale
- Prefer explicit, readable code over abstraction
- Minimize user friction
- Avoid premature complexity
- Keep the app understandable by humans and AI tooling

---

## When to Revisit Architecture

Re-evaluate this architecture if:

- A mobile app is added
- Multiple independent services are introduced
- High-volume, multi-tenant usage becomes a requirement

Until then, this architecture is intentionally simple.
