# This file describes the App's DB Schema

## InboxHQ Database Schema

### `demo_profile`
Single demo user profile (one row only)
- `id` uuid PK
- `user_id` uuid FK → auth.users(id)
- `full_name` text
- `email` text
- `avatar_url` text
- `created_at` timestamptz
- `updated_at` timestamptz

### `actors`
Fictional people shown in UI (not real users, no auth)
- `id` uuid PK
- `name` text
- `email` text
- `avatar_url` text
- `role` text (e.g., "Customer", "Support Agent", "Manager")
- `created_at` timestamptz

### `tickets`
Support tickets
- `id` uuid PK
- `subject` text
- `body` text
- `status` text (open | pending | closed)
- `priority` text (low | normal | high | urgent)
- `from_actor_id` uuid FK → actors(id)
- `from_name` text (denormalized)
- `assigned_to_actor_id` uuid FK → actors(id)
- `assigned_to_name` text (denormalized)
- `created_at` timestamptz
- `updated_at` timestamptz

### `comments`
Replies/comments on tickets
- `id` uuid PK
- `ticket_id` uuid FK → tickets(id)
- `actor_id` uuid FK → actors(id)
- `actor_name` text (denormalized)
- `body` text
- `created_at` timestamptz

### Indexes
- `idx_tickets_status` on tickets(status)
- `idx_tickets_priority` on tickets(priority)
- `idx_tickets_created_at` on tickets(created_at DESC)
- `idx_comments_ticket_id` on comments(ticket_id)
- `idx_comments_created_at` on comments(created_at)

### Notes
- No RLS policies (single-user demo app per APP.md)
- Actors are plain reference data, not auth users
- Denormalized fields (from_name, actor_name) for simpler queries
- `updated_at` managed by Edge Functions, not database triggers