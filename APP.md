# APP.md
SupportDesk Portal (customer portal + admin inbox)

## Overview
SupportDesk Portal is a lightweight B2B support messaging system.

Customers can:
- Log in securely
- Create support conversations
- Read conversation history
- Reply with messages
- Upload and view attachments

Admins can:
- Log in securely
- View all customers and all conversations in an inbox
- Filter by status and tags
- Search across conversation history
- Reply to customers
- Update conversation status and tags

This is an MVP that must feel like real software: persistence, permissions, search, attachments, and solid empty/error states.

## Roles
Two roles exist:

- "customer"
  - Access is restricted to a single customer account.
  - Can create conversations and send messages within their customer scope.
  - Can upload and view attachments within their customer scope.

- "admin"
  - Can access all customers, conversations, messages, and attachments.
  - Can update conversation status and tags.
  - Can search across all content.

User role and customer membership are stored in the `profiles` table, keyed by Supabase Auth `user.id`.

## Core workflows

### Customer workflow
1) Customer logs in
2) Customer sees a list of their conversations with:
   - subject
   - status ("open", "pending", "closed")
   - tags
   - last updated time
3) Customer creates a new conversation (subject + initial message)
4) Customer opens a conversation thread to:
   - read all messages
   - send a reply
   - upload attachments

### Admin workflow
1) Admin logs in
2) Admin sees an inbox of all conversations across customers
3) Admin can:
   - filter by status
   - filter by tags
   - search across subjects and message bodies
4) Admin opens a conversation thread to:
   - read all messages
   - reply
   - update status
   - add/remove tags
   - view attachments

## Tech stack
- Frontend: React + Vite
- UI: shadcn/ui + Tailwind CSS
- State: Jotai (UI state: filters, selected conversation, drafts, view preferences)
- Backend: Supabase (Postgres + Auth + Storage)
- Hosting: Vercel (static hosting for the frontend)

The frontend talks directly to Supabase using the anon key. Security is enforced by Supabase Row Level Security (RLS) and Storage policies.

## Data model
Keep the schema minimal and predictable. Ideas for the data model below. Change as needed.

### `customers`
Represents a customer organization.
- `id` uuid pk
- `name` text
- `created_at` timestamp

### `profiles`
One row per authenticated user.
- `id` uuid pk, equals auth.users.id
- `role` text: "admin" | "customer"
- `customer_id` uuid nullable fk -> customers.id (null for admins)
- `created_at` timestamp

### `conversations`
A conversation belongs to a customer.
- `id` uuid pk
- `customer_id` uuid fk -> customers.id
- `subject` text
- `status` text: "open" | "pending" | "closed"
- `tags` text[] (or json array)
- `created_by` uuid (auth user id)
- `created_at` timestamp
- `updated_at` timestamp

### `messages`
Messages belong to a conversation.
- `id` uuid pk
- `conversation_id` uuid fk -> conversations.id
- `author_id` uuid (auth user id)
- `author_role` text: "admin" | "customer"
- `body` text
- `created_at` timestamp

### `attachments`
Attachment metadata for a message. File bytes live in Supabase Storage.
- `id` uuid pk
- `message_id` uuid fk -> messages.id
- `customer_id` uuid fk -> customers.id (denormalized for simpler RLS)
- `file_path` text (path in Storage bucket)
- `file_name` text
- `file_type` text
- `file_size` int
- `created_at` timestamp

## Storage
Supabase Storage bucket: `attachments`

Path convention:
`{customerId}/{conversationId}/{messageId}/{uuid}-{filename}`

## Security (non-negotiable)
RLS must be enabled and enforced on every table:
- customers
- profiles
- conversations
- messages
- attachments

Storage policies must be enabled and enforced on the `attachments` bucket.

The database must enforce access control. Do not rely on client-side checks for security.

### Required RLS behavior

Profiles:
- Users can read their own profile row.
- Admin users may read all profiles only if required by the UI.

Customers:
- Customer users can read only their own customer row (matching profiles.customer_id).
- Admin users can read all customers.

Conversations:
- Customer users can read/write only rows where conversations.customer_id = profiles.customer_id.
- Admin users can read/write all rows.

Messages:
- Customer users can read/write only messages in conversations that belong to their customer.
- Admin users can read/write all rows.

Attachments:
- Customer users can read/write only rows where attachments.customer_id = profiles.customer_id.
- Admin users can read/write all rows.

Storage:
- Customer users can read and upload on
