# Changelog

## 2026-01-09
### Database Schema & Migrations
- Created all core database migrations for SupportDesk Portal
	- `20260109000001_create_customers.sql` - Customer organizations table
	- `20260109000002_create_profiles.sql` - User profiles with role and customer association
	- `20260109000003_create_conversations.sql` - Support conversations with status/tags
	- `20260109000004_create_messages.sql` - Messages within conversations
	- `20260109000005_create_attachments.sql` - Attachment metadata (files in Storage)
	- `20260109000006_create_demo_state.sql` - Demo reset tracking table
	- `20260109000010_enable_rls_and_policies.sql` - Complete RLS policies for all tables
	- `20260109000011_create_storage_bucket_and_policies.sql` - Storage bucket and policies

### Documentation
- Updated DB_STRUCTURE.md with complete SupportDesk Portal schema documentation
- Added demo credentials to .env (DEMO_EMAIL, DEMO_PASSWORD)

## 2026-01-06
- Added GENERAL_GUIDELINES.md as the reusable playbook for setup, workflow, testing, and theming.
- Rewrote README.md to describe the starter stack and demo pages.
- Condensed APP_FILE_INDEX.md, DB_STRUCTURE.md, TESTING_INSTRUCTIONS.md, and THEMING.md into slim stubs.
- Removed legacy/domain-specific docs (ONBOARDING, FUNCTIONALITY, CLI, API_CALLS, JOTAI_MIGRATION, SHADCN_AUDIT_RESULTS, MOCKUPS, BRAIN_DUMP, docs/).
