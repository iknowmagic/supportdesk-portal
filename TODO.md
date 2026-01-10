# Active TODO

===

Files of interest. 

The files: DB_STRUCTURE.md and APP_FILE_INDEX.md can be used as general guides to avoid guessing or making erroneous
assumptions. When you notice a discrepancy between what's real (changes to the DB that are not present in DB_STRUCTURE.md), 
and these files, update DB_STRUCTURE.md or APP_FILE_INDEX.md accordingly.

Abide by THEMING.md (ensure light default, dark explicit, correct token overrides) and reuse existing styling primitives.

Favor shadcn/ui components over HTML form fields.

---

Example section and task:
## This is a section
- [ ] This is a task.

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

## Database Schema & Migrations
- [x] Create migration: customers table (id, name, created_at)
- [x] Create migration: profiles table (id=auth.uid, role, customer_id fk, created_at)
- [x] Create migration: conversations table (id, customer_id fk, subject, status, tags, created_by, created_at, updated_at)
- [x] Create migration: messages table (id, conversation_id fk, author_id, author_role, body, created_at)
- [x] Create migration: attachments table (id, message_id fk, customer_id fk, file_path, file_name, file_type, file_size, created_at)

## RLS Policies & Security
- [x] Enable RLS on customers table
- [x] Enable RLS on profiles table
- [x] Enable RLS on conversations table
- [x] Enable RLS on messages table
- [x] Enable RLS on attachments table
- [x] Create RLS policy: customers (customer read own, admin read all)
- [x] Create RLS policy: profiles (user read own profile)
- [x] Create RLS policy: conversations (customer scoped to their customer_id, admin read/write all)
- [x] Create RLS policy: messages (customer scoped via conversation, admin read/write all)
- [x] Create RLS policy: attachments (customer scoped via customer_id, admin read/write all)
- [x] Configure Supabase Storage bucket: attachments
- [x] Create Storage RLS policy: customer upload/read own, admin all

## Authentication & Login
- [x] Set up Supabase Auth integration (configure JWT, email settings)
- [x] Add demo credentials to .env (DEMO_EMAIL, DEMO_PASSWORD)
- [ ] Create Login page UI (email + password form, error states)
- [ ] Pre-populate login form with demo credentials from .env
- [ ] Add optional "Log in" button that auto-submits demo credentials
- [ ] Implement Supabase Auth login handler
- [ ] Implement role-based route guards (redirect customer/admin to correct dashboard)
- [ ] Create logout functionality with session cleanup
- [ ] Implement profile fetch on app load (determine user role + customer_id)
- [ ] Add auth state management (Jotai atom for current user)
- [ ] Create protected route wrapper component

## Customer Dashboard & Conversation List
- [ ] Create customer dashboard layout
- [ ] Fetch customer's conversations list (with status, tags, last_updated)
- [ ] Display conversation cards (subject, status badge, tags, updated_at timestamp)
- [ ] Implement conversation sorting (by updated_at descending)
- [ ] Create empty state (no conversations yet)
- [ ] Add loading skeleton for conversation list
- [ ] Route to conversation detail on card click

## Create Conversation Flow
- [ ] Create "New Conversation" button in customer dashboard
- [ ] Create modal: conversation creation form (subject + initial message)
- [ ] Implement file upload input in modal
- [ ] Validate form (subject required, message required)
- [ ] Insert conversation + initial message + attachments to database
- [ ] Add error handling (display Sonner toast on failure)
- [ ] Redirect to conversation detail after creation
- [ ] Add success toast confirmation

## Conversation Thread View (Customer & Admin)
- [ ] Create conversation detail page layout
- [ ] Fetch conversation metadata (subject, status, tags, created_by, created_at)
- [ ] Fetch messages list (ordered by created_at, paginated or infinite scroll)
- [ ] Display message bubbles (author name/role, body, timestamp, attachments)
- [ ] Implement reply form (text input + send button)
- [ ] Implement file upload in reply form (up to N files)
- [ ] Insert new message + attachments on reply
- [ ] Optimistic update: add message to UI before server confirms
- [ ] Add error handling on send failure
- [ ] Add loading states while sending

## Attachments in Messages
- [ ] Display attachment list in each message (file name, size, download link)
- [ ] Generate signed Supabase Storage URLs for downloads
- [ ] Implement file download on attachment click
- [ ] Add file type icons to attachment list
- [ ] Add upload progress indicator during attachment upload
- [ ] Validate file size before upload (enforce limit in .env)

## Admin Inbox View
- [ ] Create admin dashboard layout (sidebar + main content area)
- [ ] Fetch all conversations across all customers (with customer_id join for name)
- [ ] Display conversation list with customer name, subject, status, tags, updated_at
- [ ] Create empty state (no conversations)
- [ ] Add loading skeleton for conversation list
- [ ] Route to conversation detail on card click

## Admin Filtering & Search
- [ ] Create filter sidebar: status filter (checkbox: open, pending, closed)
- [ ] Create filter sidebar: tag filter (multi-select or chips)
- [ ] Create search input (search by subject + message body)
- [ ] Implement client-side filter logic (with Jotai state for filters)
- [ ] Add clear filters button
- [ ] Persist filter state to Jotai atoms
- [ ] Add debounce to search input

## Admin Conversation Actions
- [ ] Add status dropdown in conversation thread (open, pending, closed)
- [ ] Implement status update on database (with optimistic update)
- [ ] Add tag add/remove UI (chip input or multi-select)
- [ ] Implement tag update on database
- [ ] Add admin label to admin messages ("Admin" badge next to message)
- [ ] Add confirmation toast on status/tag update

## Admin Reply
- [ ] Ensure admin reply form works same as customer
- [ ] Add "Admin" label/badge to admin messages in thread
- [ ] Admins can upload attachments in replies

## UI & Design System
- [ ] Set up shadcn/ui Button, Card, Input, Badge, Dialog, Select components
- [ ] Create page header component (title + breadcrumb)
- [ ] Create empty state component (icon + message + CTA)
- [ ] Create error state component (error icon + message + retry button)
- [ ] Add loading skeleton components (conversation list, messages)
- [ ] Implement Sonner toast setup (success, error, info)
- [ ] Ensure responsive design (mobile-first approach)
- [ ] Apply light theme as default (add dark variants per THEMING.md)

## State Management (Jotai Atoms)
- [ ] Create atom: currentUser (id, role, customer_id, email)
- [ ] Create atom: selectedConversationId (for detail view)
- [ ] Create atom: filterState (status, tags, search query)
- [ ] Create atom: draftMessage (for conversation thread)
- [ ] Create atom: draftAttachments (files pending upload)
- [ ] Implement atom persistence (localStorage for non-auth state)

## API Integration & TanStack Query
- [ ] Create API helper: fetchConversations (customer or admin scoped)
- [ ] Create API helper: createConversation (with initial message + attachments)
- [ ] Create API helper: fetchConversationDetail (metadata)
- [ ] Create API helper: fetchMessages (by conversation_id)
- [ ] Create API helper: createMessage (with attachments)
- [ ] Create API helper: updateConversationStatus
- [ ] Create API helper: updateConversationTags
- [ ] Create API helper: uploadAttachment to Supabase Storage
- [ ] Set up TanStack Query hooks for each API call
- [ ] Implement error handling & retry logic in query hooks

## Testing - Auth & Authorization
- [ ] Write test: customer can log in
- [ ] Write test: admin can log in
- [ ] Write test: logged out user redirected to login
- [ ] Write test: customer redirected to customer dashboard
- [ ] Write test: admin redirected to admin dashboard
- [ ] Write test: customer cannot access admin routes

## Testing - Database & RLS
- [ ] Write test: customer can read own conversations (RLS enforced)
- [ ] Write test: customer cannot read other customer's conversations
- [ ] Write test: admin can read all conversations
- [ ] Write test: customer can create conversation in own customer
- [ ] Write test: customer cannot create conversation for other customer
- [ ] Write test: customer can read/write own messages only
- [ ] Write test: customer can read/write own attachments only

## Testing - Customer Workflows
- [ ] Write test: customer can create conversation with message + attachment
- [ ] Write test: customer can reply to conversation
- [ ] Write test: customer can upload file in reply
- [ ] Write test: customer can download attachment (verify signed URL works)
- [ ] Write E2E test: full customer workflow (login → create → reply → logout)

## Testing - Admin Workflows
- [ ] Write test: admin can see all conversations
- [ ] Write test: admin can filter conversations by status
- [ ] Write test: admin can filter conversations by tags
- [ ] Write test: admin can search conversations (subject + body)
- [ ] Write test: admin can update conversation status
- [ ] Write test: admin can add/remove tags
- [ ] Write test: admin can reply to conversation
- [ ] Write E2E test: full admin workflow (login → filter → reply → update status → logout)

## Demo Reset Endpoints (Internal vs External)

### Database Setup
- [x] Create `demo_state` table (id, last_reset_at, next_reset_at)
- [x] Seed initial `demo_state` row with current timestamp + next hour

### Shared Reset Logic
- [ ] Create shared function: wipeAndReseedDemoData()
- [ ] Implement: delete all demo conversations (for demo customer only)
- [ ] Implement: delete all demo messages (via conversation cascade or explicit)
- [ ] Implement: delete all demo attachments records (for demo customer only)
- [ ] Implement: delete demo attachment files from Storage bucket (demo customer folder paths)
- [ ] Implement: reseed demo conversations with sample data
- [ ] Implement: reseed demo messages with sample replies
- [ ] Implement: reseed demo attachments (upload sample files to Storage)
- [ ] Implement: update `demo_state` with `last_reset_at` = now and `next_reset_at` = next hour

### Internal Authenticated Reset Endpoint
- [ ] Create endpoint: `reset-demo` (POST or GET)
- [ ] Add authentication requirement (verify JWT)
- [ ] Call shared reset function: wipeAndReseedDemoData()
- [ ] Return success response with next_reset_at timestamp
- [ ] Add error handling (return 401 if not authenticated, 500 if reset fails)

### External Unauthenticated Reset Endpoint
- [ ] Create endpoint: `reset-84b1d9` (POST or GET)
- [ ] No authentication required
- [ ] Implement cooldown check: if last_reset_at < 5 minutes ago, return success without reset
- [ ] Call shared reset function: wipeAndReseedDemoData()
- [ ] Return success response with next_reset_at timestamp
- [ ] Add error handling (return 429 if cooldown active, 500 if reset fails)

### UI: Reset Button
- [ ] Add "Reset demo data" button to dashboard (visible when authenticated)
- [ ] Implement button click handler: call `reset-demo` endpoint
- [ ] Show loading state during reset
- [ ] Display success toast on reset completion
- [ ] Display error toast on reset failure
- [ ] Refresh conversation list after successful reset

### UI: Reset Countdown Display
- [ ] Compute next hourly reset time from current time (client-side: next HH:00:00)
- [ ] Calculate time remaining until next top-of-hour (mm:ss format)
- [ ] Display countdown: "Demo resets in mm:ss" or "Next reset at HH:00"
- [ ] Update countdown every second (setInterval)
- [ ] Reset countdown when reaching 00:00 (start next hour countdown)
- [ ] Position countdown in header or footer (non-intrusive)

### Testing - Demo Reset
- [ ] Write test: internal reset endpoint requires authentication
- [ ] Write test: internal reset endpoint wipes and reseeds demo data
- [ ] Write test: external reset endpoint works without authentication
- [ ] Write test: external reset endpoint respects cooldown (< 5 min)
- [ ] Write test: both endpoints update demo_state correctly
- [ ] Write test: both endpoints delete Storage files correctly
- [ ] Write test: countdown UI displays correct remaining time (client-side computed)
- [ ] Write test: countdown updates every second
- [ ] Write test: login form pre-populated with demo credentials from .env

## Documentation
- [ ] Update APP_FILE_INDEX.md with new components and file structure
- [ ] Create DB_STRUCTURE.md documenting all tables, RLS policies, indexes
- [ ] Create ARCHITECTURE.md explaining data flow and state management
- [ ] Add JSDoc comments to API helper functions
- [ ] Document environment variables in .env.example
- [ ] Create SETUP.md for local development instructions

## Deployment & Polish
- [ ] Test on staging environment
- [ ] Run `pnpm lint` and fix all linting issues
- [ ] Run full test suite `pnpm test` and verify all pass
- [ ] Run bundle analysis (optimize if needed)
- [ ] Test on real Supabase production URL (if applicable)
- [ ] Add error monitoring / logging (Sentry or similar, optional)
- [ ] Create screenshot/demo for portfolio
- [ ] Update README.md with feature list and deploy link


