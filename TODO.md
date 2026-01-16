# Active TODO

===

Files of interest. 

The files: DB_STRUCTURE.md and APP_FILE_INDEX.md can be used as general guides to avoid guessing or making erroneous
assumptions. When you notice a discrepancy between what's real (changes to the DB that are not present in DB_STRUCTURE.md), 
and these files, update DB_STRUCTURE.md or APP_FILE_INDEX.md accordingly.

Abide by THEMING.md (ensure light default, dark explicit, correct token overrides) and reuse existing styling primitives.

Favor shadcn/ui components over HTML form fields.

---

START WITH the first [ ] file below, mark completed as [x].

===

## Working rules (read once, then do tasks only)
- TL;DR per task (each step is separate):  
  1) Run `pnpm lint`.  
  2) Run `pnpm test:failing-files` and confirm there are no failing tests (baseline green).  
  3) Add a failing test that proves the current feature/bug is broken.  
  4) Implement the feature/fix.  
  5) Rerun and make the previously failing test pass and keep the suite green.  
  6) Add extra tests for additional cases.
- Work one checkbox at a time; mark [x] only when code + tests + prove step are done.
- No mocking; hit real APIs/edge functions (see `tests/helpers/auth.ts`). Tests can live in any `tests/` file.
- For any code change: keep lint clean, use the Failing Tests workflow, prefer `pnpm test:failing-files` then `pnpm test <file>` to iterate. If a “failing test” passes immediately, reassess the test or the need for the change.
- Failing Tests workflow (must follow):  
  1) Run `pnpm test:failing-files` once to list failing files.  
  2) For each file reported, run `pnpm test <file>` and fix that file’s failures before moving to the next.  

- **Note:** Do not use `fetch` directly in frontend code — use **TanStack Query** and centralized API helper functions instead. Server-side code (e.g. `supabase/**`) is exempt and may use global `fetch` where appropriate.

ALL TASKS BELOW THIS POINT

IMPORTANT: Refer APP.md for background information regarding this app. Read it at least once!
---

## Phase 1: Foundation & Auth

### Database Setup
- [x] Create base migration for demo user profile table (single row for demo user)
- [x] Create migration for `actors` reference table (fictional people shown in UI: names, avatars)
- [x] Create migration for `tickets` table (support tickets with fromName, assigneeName, status, priority, subject, body, createdAt, updatedAt)
- [x] Create migration for `comments` table (replies on tickets, with actorName and body)
- [x] Add seed script to populate demo data (realistic tickets, comments, actors)
- [x] Verify seeded data is deterministic and covers primary screens
- [x] Require authentication for REST access to demo tables (RLS + policies)
- [x] Revoke anon role privileges on demo tables
- [x] Update reset functions to generate dense deterministic demo data after wipe

### Auth & Session
- [x] Update login form to accept DEMO_USER credentials from .env
- [x] Implement session management (localStorage flag or cookie)
- [x] Add logout functionality (clear session, return to login)
- [x] Add route protection (redirect to /login if not authenticated)
- [x] Test login/logout flow end-to-end
- [x] Replace login demo credentials hint with hourly reset countdown
- [x] Add seconds toggle to reset countdown display

## Phase 2: Core UI Structure

### Layout & Navigation
- [x] Create app shell layout (header, sidebar/nav, main content area)
- [x] Show hourly reset countdown in the header
- [x] Build header component (app logo/name, demo user indicator, logout button)
- [ ] Build navigation component (links to Inbox; Settings may be added later if needed)
- [x] Add route definitions for main screens (/inbox, /tickets/:id) (Settings may be added later if needed)
- [ ] Implement PageTransition animations for route changes

### Inbox/Dashboard
- [ ] Create inbox/dashboard page that lists all tickets
- [ ] Display ticket cards/rows with: subject, fromName, status, priority, timestamp
- [ ] Add filtering UI (status dropdown: all/open/pending/closed)
- [ ] Add search input (filter by subject or body text)
- [ ] Implement empty state for no tickets
- [ ] Add "New Ticket" button (opens modal or form)
- [x] Route ticket list through authenticated Edge function (no direct REST calls)

## Phase 3: Ticket Management

### Ticket Detail View
- [ ] Create ticket detail page (/tickets/:id)
- [ ] Display full ticket info: subject, fromName, assigneeName, status, priority, body, createdAt
- [ ] Show comment thread below ticket body
- [ ] Display comment author (actorName), body, timestamp
- [ ] Add reply/comment form at bottom
- [ ] Implement "Add Comment" functionality (insert into comments table)
- [ ] Add status update controls (dropdown to change status)
- [ ] Add assignee selector (dropdown of actors)
- [ ] Test ticket detail and comment posting

### Ticket Creation
- [ ] Build "New Ticket" modal/form
- [ ] Add form fields: subject, description/body, priority, from actor
- [ ] Implement form validation (required fields)
- [ ] Create ticket in DB on submit
- [ ] Redirect to new ticket detail page after creation
- [ ] Show success toast notification
- [ ] Test ticket creation flow end-to-end

## Phase 4: Polish & Demo Features

### Settings & Profile
- [ ] Create settings page with minimal demo user profile display
- [x] Add "Reset Demo" button to restore original seeded data
- [x] Implement reset functionality (truncate tables, re-run seed script)
- [x] Add confirmation dialog before reset
- [x] Test reset demo functionality

### Error & Empty States
- [ ] Add error boundary component for unexpected errors
- [ ] Design and implement empty state for inbox (no tickets)
- [ ] Design and implement empty state for ticket with no comments
- [ ] Add loading states for data fetching (skeleton screens)
- [ ] Add error state for failed API requests (retry option)

### Final Testing & QA
- [ ] Run full lint check (`pnpm lint`) and fix all issues
- [ ] Run full test suite (`pnpm test`) and ensure all pass
- [ ] Manual QA: test login → inbox → create ticket → view ticket → add comment → logout
- [ ] Manual QA: test filtering and search
- [ ] Manual QA: test reset demo
- [ ] Verify no multi-user features exist (no invites, orgs, roles UI)
- [ ] Update DB_STRUCTURE.md with final schema
- [ ] Update APP_FILE_INDEX.md with all new components/pages
- [ ] Update CHANGELOG.md with summary of work

## Phase 5: Documentation & Deployment

### Documentation
- [ ] Document demo credentials clearly in README.md
- [ ] Add "First Run" instructions to README
- [ ] Document seed data reset process
- [ ] Add screenshots or demo GIF to README (optional)

### Deployment Prep
- [ ] Verify all env vars are documented
- [ ] Test build process (`pnpm build`)
- [ ] Verify production build works (`pnpm preview`)
- [ ] Prepare deployment configuration for Vercel
- [ ] Add deployment instructions to README

---
