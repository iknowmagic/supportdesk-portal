# Changelog

## 2026-01-14
- Reworked reset seeding to generate deterministic demo profiles, actors, tickets, and comments after wipes.
- Updated reset_db_4214476 to sign in with demo credentials (env or request payload) before seeding.
- Expanded reset API tests to validate counts and denormalized field consistency.
- Treated missing-session logout as success and added logout toast coverage tests.
- Enabled RLS policies to require authentication on demo tables and added REST auth coverage tests.
- Routed ticket listing through an authenticated Edge function and added auth tests for the endpoint.
- Revoked anon table privileges to prevent unauthenticated REST access to demo tables.
- Removed legacy GraphQL/REST helpers to enforce Edge-function-only data access and sanitized ticket list errors.
- Added an AppShell layout with header/sidebar structure and wrapped the primary pages.
- Added demo auto-login persistence so sessions only end after explicit logout.
- Replaced the login demo credentials hint with an hourly reset countdown message.
- Added a seconds toggle to the reset countdown display.
- Added the reset countdown indicator to the app header.
- Treated expired sessions as unauthenticated to ensure home redirects to login.
- Added inbox and ticket detail routes, with / redirecting to /inbox.
- Disabled refresh token rotation so demo sessions persist until explicit logout.
- Added a ticket detail Edge function plus a richer ticket detail page layout.
- Added session refresh handling and increased JWT expiry to keep demo sessions alive longer.
- Added SidebarNav tests to cover route highlighting and navigation.
- Added route transition animations with PageTransition and coverage for transition keys.
- Validated stored Supabase sessions before treating users as authenticated to avoid stale-token 401s.
- Centralized access token retrieval with refresh handling for Edge function calls.
- Treated expired sessions as a no-op logout while preserving explicit logout behavior.
- Moved ticket list filtering/search to the Edge function and added coverage for status/query filters.
- Added an actors list Edge function plus API helper and auth coverage for actor lookups.
- Invalidate ticket and actor queries after demo reset so the UI rehydrates with fresh data.
- Added ticket creation Edge function plus API helper and auth coverage for creation defaults/denormalized fields.
- Stabilized New Ticket modal tests by seeding actor cache and stubbing scrollIntoView for Radix Select.
- Serialized Vitest file execution and added pointer capture stubs to keep reset-dependent tests stable.
- Kept the "From" actor select controlled and aligned test interactions with userEvent keyboard input.

## 2026-01-06
- Added GENERAL_GUIDELINES.md as the reusable playbook for setup, workflow, testing, and theming.
- Rewrote README.md to describe the starter stack and demo pages.
- Condensed APP_FILE_INDEX.md, DB_STRUCTURE.md, TESTING_INSTRUCTIONS.md, and THEMING.md into slim stubs.
- Removed legacy/domain-specific docs (ONBOARDING, FUNCTIONALITY, CLI, API_CALLS, JOTAI_MIGRATION, SHADCN_AUDIT_RESULTS, MOCKUPS, BRAIN_DUMP, docs/).
