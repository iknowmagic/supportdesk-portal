# InboxHQ - APP.md (Project Guidelines)

## What this project is
InboxHQ is a portfolio/demo web app with a single demo login and a fully seeded, "feels real" dataset.

The core goal is: a user logs in with the provided demo credentials and immediately has a seamless experience exploring the product. Everything should feel populated and alive from the first click.

This is a make-believe scenario. The app may display other "people" in the UI (names, avatars, assignees, senders), but they are fictional actors inside seeded data, not real accounts.

RLS is intentionally out of scope because this is a single-user demo and the database is not exposed to the client.

## The Golden Rule: Demo Mode, Single User
There is exactly one real logged-in account: the demo user.

- Only one user can log in.
- There is no registration.
- There is no invitation system.
- There are no teams, orgs, workspaces, or memberships.
- There are no roles.
- There is no RBAC.
- There are no permission matrices.

If you start building multi-user features, you are building the wrong app.

## Non-goals (Do NOT build these)
Hard "no" list:

- Multi-user accounts beyond the single demo user
- RBAC (roles, permissions, admin vs member)
- Organizations, teams, workspaces, tenant isolation
- Invites, email verification, password reset, SSO
- User directory, admin user management pages
- Audit logs, activity trails for compliance
- Row-level security policies that assume many users (avoid the RLS rabbit hole)
- Anything that requires a "currentUserId" parameter to be passed around everywhere

If you think any of the above is "needed", stop and propose a simpler demo-mode alternative.

## What we ARE building
A polished product experience that is believable and coherent, using seeded data.

The app should have:
- A login screen that accepts the demo credentials
- A post-login home/dashboard that has meaningful content immediately
- Core workflows that feel complete (no dead-end screens)
- Realistic empty/error states where appropriate
- A simple way to reset the demo data (optional but strongly recommended)

## Data model principle
All data belongs to the demo user, even if the UI shows other people.

How to represent "other people":
- Use "Actors" as plain data fields (e.g., `fromName`, `assigneeName`, `contactName`, `avatarUrl`)
- These actors are not users, cannot log in, and have no permissions
- Do not create an "accounts" table or "users" table for these fictional people unless it is purely static reference data (and even then, prefer a simple `actors` lookup table with no auth semantics)

### Ownership rule
Avoid multi-tenant patterns.

- Do NOT add `org_id`, `workspace_id`, `member_id`, etc.
- If you include an `owner_id`, it should be a single constant value for the demo user.
- Do NOT build queries that filter by a variable user id coming from auth, unless absolutely required by your stack. Prefer constant demo scoping.

## Seeding and "first run" experience
The app must feel populated right after login.

Preferred approaches (pick one, simplest wins):
1. Seed script runs automatically on first run (or first login) and inserts demo data.
2. Seed data ships as a local JSON fixture and the app reads it (for a fully frontend demo).
3. If using a DB, ensure the DB is already seeded in dev, and provide a one-command reset.

Requirements:
- Seeded data should be deterministic. Same login, same experience.
- Data should cover the primary screens and flows.
- Include realistic variation: different statuses, timestamps, categories, priorities, etc.

Optional but nice:
- Add a "Reset demo" button in settings to restore the original dataset.

## Auth and session (keep it boring)
This is a demo. Treat auth as a front door, not a security product.

- Provide exactly one set of demo credentials (store in env or a config file).
- Login success creates a session flag (cookie or localStorage) and routes to the app.
- Logout clears the flag and returns to login.
- No registration, no email verification, no password reset.

If using an auth provider, it still must behave like a single demo account with no user lifecycle features.

## UI language rules (avoid confusing users and avoid confusing the AI)
UI should not imply a real multi-user platform.

Avoid:
- "Invite teammates"
- "Manage users"
- "Roles and permissions"
- "Workspace settings"
- "Organization"

Prefer:
- "Settings"
- "Profile" (only for the demo user, minimal)
- "Preferences"
- "About this demo" (optional small footer or info)

If the UI shows other names, it should be in context (senders, contacts, assignees), not as system users.

## Implementation constraints (anti-overengineering guardrails)
- Keep architecture single-tenant and demo-first.
- Avoid complicated policies, permission systems, and multi-user abstractions.
- Prefer well-known libraries for UI and routing, but do not introduce infra complexity just because it exists.
- If using a DB with RLS by default, do NOT build complex policies. Either:
  - disable RLS for demo tables (acceptable for a portfolio demo), or
  - use the simplest possible single-user policy with a constant demo identity
- Do not build "future-proof" scaffolding for multi-user. That is explicitly out of scope.

Decision rule:
- When uncertain, choose the simplest approach that improves the demo experience.

## Acceptance checklist (Definition of Done)
- [ ] Demo credentials are documented in one place (README or login hint)
- [ ] Login works reliably and routes to the home screen immediately
- [ ] Post-login screens are populated with seeded data (no blank product)
- [ ] Primary flows are navigable and coherent end-to-end
- [ ] Empty and error states exist where meaningful
- [ ] No multi-user features exist (invites, orgs, RBAC, user management)
- [ ] No RLS complexity is introduced that assumes multiple users
- [ ] The app feels like a believable product demo, not a half-built admin console

## Notes for any coding agent
If you find yourself adding:
- an `organizations` table
- a `memberships` table
- a `roles` table
- a permissions system
- invite flows
- multiple user accounts

Stop. You are building the wrong thing. Re-read "The Golden Rule" and simplify.
