# Changelog

## 2026-01-14
- Reworked reset seeding to generate deterministic demo profiles, actors, tickets, and comments after wipes.
- Updated reset_db_4214476 to sign in with demo credentials (env or request payload) before seeding.
- Expanded reset API tests to validate counts and denormalized field consistency.
- Treated missing-session logout as success and added logout toast coverage tests.
- Enabled RLS policies to require authentication on demo tables and added REST auth coverage tests.
- Routed ticket listing through an authenticated Edge function and added auth tests for the endpoint.

## 2026-01-06
- Added GENERAL_GUIDELINES.md as the reusable playbook for setup, workflow, testing, and theming.
- Rewrote README.md to describe the starter stack and demo pages.
- Condensed APP_FILE_INDEX.md, DB_STRUCTURE.md, TESTING_INSTRUCTIONS.md, and THEMING.md into slim stubs.
- Removed legacy/domain-specific docs (ONBOARDING, FUNCTIONALITY, CLI, API_CALLS, JOTAI_MIGRATION, SHADCN_AUDIT_RESULTS, MOCKUPS, BRAIN_DUMP, docs/).
