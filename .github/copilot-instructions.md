## Overview & Mindset

- Before coding, surface a quick gut-check: propose options/risks, flag if the request seems off, and ask for confirmation when the direction is ambiguous or risky. Default to offering alternatives instead of silently proceeding.
- Absolutely NEVER bypass auth/RLS. Every request must use the authenticated client for that user; do not use service-role or privileged clients for user-scoped data. Follow Supabase security best practices and never work around RLS.

- IMPORTANT: Prove changes with tests. For any feature/bugfix you touch, add/extend the appropriate tests and run the relevant `pnpm test …` (or full suite if broad). Report exactly which commands ran and their results before saying the work is done. If something can’t be tested, state why.
- We are building a smart task scheduler where the system decides how to allocate tasks.
- Think First, Code Second
- IMPORTANT: Ask "does this logic belong in the frontend?" If yes, push it down to the backend. Keep the client lean/dumb: minimal payloads, no business rules, no ordering/state that must persist. The backend must derive defaults, apply rules, validate, and own ordering/data shape so any future frontend can be swapped without losing behavior.
- Before writing any code, you must pause, analyze the request, and validate the approach.
- Before any UI/theming work, re-read THEMING.md; keep light as default, add explicit dark variants, and honor the token guidance.
- When I ask you to do something, first reflect if it makes sense or not. If it doesn't make sense, tell me why and suggest alternatives. You are allowed to push back when something works against UX or it is introducing a counterproductive or counterintuitive pattern. ALWAYS work with the principle of "Think First, Code Second". Do not just blindly do something without analyzing it first.
- Be concise. Summarize and shorten your responses as much as possible. Do not write an "essay" or long, lengthly explanation.
- Using `data-testid` attributes to aid testing is OK and encouraged; add them where they improve testability or clarity. USE data-testid instead of DOM queries!
- After completing any task, run `pnpm lint` and fix lint errors before proceeding.
- FRONTEND MUST BE LEAN & DUMB. Move business logic to the backend whenever possible. Keep client payloads minimal (send only the fields the backend truly needs) and let the server derive defaults, apply rules, and validate. If you spot logic in the frontend that belongs server-side, call it out and push it down.
- No database functions. This has proven to be a maintenance nightmare. Favor backend code instead, as it is easier to test, version, and maintain.
- AGAIN, please it's important: When possible, push the logic to the backend, not the frontend. when possible, means favor a backend-first approach for ANYTHING related to the frontend. If you spot logic in the frontend that can be simplified by moving it to the backend, call it out and push it down. NO EXCEPTIONS. NO BUSINESS LOGIC IN THE FRONTEND. The day of tomorrow I should be able to switch to a different frontend framework with minimal changes to the backend, and without losing any business logic. That's the attitute: treat the frontend as a thin layer over the backend, that can be replaced at any time.

## Workflow & Communication

- Any changes that affect the UI must be approved by the user. Notify the user that the changes are ready and ask for explicit approval before proceeding.
- No hacks, ever. This includes introducing setTimeout to deal with race conditions, etc. Skipping a test is also considered a hack. Either the test is not valid or the code is not working as intended. Fix the underlying issue instead. OR rewrite the test if it keeps failing.
- Always surface user-facing actions and errors with Sonner toasts; add tests that assert toasts fire on success/error for any user-visible mutation.
- For large tasks, explicitly break the work into small chunks and finish one chunk at a time. Avoid pausing with partial status updates; only report once a chunk is complete and tested.
- Placeholder-First Methodology. Build the UI first and wire it up later.
  - Step 1: make the UI element visually correct.
  - Step 2: connect it to local state.
  - Step 3: later, connect to backend/scheduling logic.
- Tasks are stored in the TODO.md file. Before starting a new task, verify that the task is listed in TODO.md and has not already been completed. "[ ]" means the task is not yet completed, "[x]" means the task is completed. If the task is not in the TODO.md, inform the user to allow adding the task to the TODO.md.
- When I say I am stuck, need help, or ask you to explain something:
  - First, explain the confusing part in simple terms.
  - Then propose at least two possible solutions (with brief pros/cons).
  - Ask which option I prefer and wait for my reply before implementing anything.
  - This applies especially to data structures and algorithms for the smart scheduler.
- For complex tasks (scheduling rules, algorithms), if they are not in TODO.md, ask me before proceeding. I decide when to introduce new scheduling features.
- If asked to commit code, use conventional commit messages.
- After making a change, ask yourself: "Did I leave a note in the changelog?" "Did I update APP_FILE_INDEX.md if needed?" "Did I update DB_STRUCTURE.md if needed?" If the answer is no, do it before proceeding.

## Frontend & UI Guidelines

- **Time Interval Format:** Always use "min" and "hr" for time intervals (e.g., "30min", "1hr", "15min"). NEVER use shortened forms like "30m", "1h", "15m". This applies to UI labels, test assertions, constants, and user-facing strings.
- Do not volunteer informational text under form fields without asking. Assume I don't want any sort of informational messages.
- VERY IMPORTANT: Avoid prop drilling. Use Jotai atoms instead. Jotai atoms manage the app state in the frontend. Correct any deviations from this as you spot them.
- LEAN UI FIRST PLEASE. LET THE BACKEND DO THE HEAVY LIFTING. Business logic should reside in the backend; let's not dump a bunch of logic into the frontend. The frontend should be mostly concerned with displaying data and capturing user input. Propose enhancements to frontend when you spot too much business logic in the frontend.
- When touching UI, match the surrounding layout: keep proportions, colors, typography, and spacing (padding/margins) consistent with nearby elements before introducing changes.
- When a UI mock/fixture is provided, copy the markup and styling exactly (class-for-class, word-for-word). Do not reinterpret, tweak, add, or remove any UI details. Only wire functionality beneath the unchanged UI.
- Sonner is used to give feedback to the user. The messages are meant to be user friendly. Never use Sonner to output debugging information. Use NoctareDevTools to output debugging information instead.

## Backend & Database

- When adding migrations (SQL, changes to the DB), you must use a timestamp that is greater than the timestamp of the last migration used.

## Testing & APIs

- Tests can be run with:
  - `pnpm test` - Full test suite
  - `pnpm test:file <file-name>` - Single test file, output to ./tmp/test-output.json
  - `pnpm test:single <test-file> <test-name>` - Single test from a suite by name
  - `pnpm test:failing-files` - List all failing test files
- API tests confirm that the API is working as expected. No need to mock the API, just run the tests directly. The file tests/helpers/auth.ts shows how to authenticate a user in tests.

### 🚨 CRITICAL: ALWAYS Test Through Client APIs - NO EXCEPTIONS

**NEVER bypass authentication or RLS policies in tests. NEVER use service role or admin client to insert test data directly into tables that have RLS enabled.**

**WHY THIS MATTERS:**
- Bypassing client APIs creates meaningless passing tests that hide real issues
- Tests must validate the ENTIRE stack: auth → RLS → business logic → response
- If a test bypasses RLS, it proves nothing about whether users can actually access their data
- Service role should ONLY be used for: creating/deleting test users, initial test setup (windows, preferences), and cleanup

**USER SCOPING STRATEGY:**
- User scoping is enforced via **RLS policies only** (no triggers, no custom DB functions)
- `auth.uid()` is derived from the JWT Bearer token in the request
- All user-scoped tables have `user_id` column with `DEFAULT auth.uid()`
- Client inserts/updates **MUST NOT include `user_id`** - database auto-populates from JWT context
- RLS policies enforce `auth.uid() = user_id` for all operations
- This is a built-in PostgreSQL function, not a custom trigger (consistent with "no custom DB functions" rule)

**CORRECT PATTERN:**
```typescript
// ✅ CORRECT: Test through authenticated client
const { session } = await signInEphemeralTestUser();
const client = createClient(SUPABASE_URL, ANON_KEY);
await client.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });

// Insert data as the authenticated user (RLS enforced)
// DO NOT include user_id - database auto-populates from auth.uid()
const { data, error } = await client.from("user_buffer_presets").insert({
  interval_name: "test",
  buffer_before: 15,
  buffer_after: 15,
  buffer_mode: "simple",
  segment_le_minutes: null,
  // NO user_id - DEFAULT auth.uid() handles this
});
```

**WRONG PATTERNS:**
```typescript
// ❌ WRONG: Including user_id in payload (database handles this)
const { data, error } = await client.from("user_buffer_presets").insert({
  user_id: session.user.id, // ❌ DO NOT send user_id - DEFAULT auth.uid() handles this
  interval_name: "test",
});

// ❌ WRONG: Bypassing RLS with service role
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
await adminClient.from("user_buffer_presets").insert({
  interval_name: "test",
  // ... This bypasses RLS entirely!
});
```

**WHEN TO USE SERVICE ROLE (adminClient):**
1. Creating test users: `adminClient.auth.admin.createUser()`
2. Deleting test users: `adminClient.auth.admin.deleteUser()`
3. Initial setup for tables WITHOUT RLS (like setting up scheduling_windows during user creation)
4. Cleanup operations in afterAll hooks

**IMPORTANT: Service role bypasses RLS and DEFAULT auth.uid():**
- When using `adminClient` (service role), you MUST explicitly include `user_id` in INSERT/UPDATE operations
- This is because service role bypasses the JWT context that DEFAULT auth.uid() relies on
- Example: `await adminClient.from("scheduling_windows").insert({ user_id: userId, name: "Work Hours", ... })`
- Regular authenticated clients should NEVER include user_id - database auto-populates it

**RULE: If the table has RLS enabled, the test MUST use an authenticated anon client, NOT the service role.**

**Test Isolation:**
- Each test should create its own ephemeral user via `signInEphemeralTestUser()`
- Call `cleanup()` in `afterAll` to delete the test user and all their data
- Never access data from other users - tests must prove users can ONLY see their own data

## Environment & Operations

- **🚨 ABSOLUTE RULE: NEVER run ANY Supabase commands. PERIOD. NO EXCEPTIONS.**
  - ❌ NEVER run: `npx supabase`, `supabase db reset`, `supabase migration`, `supabase start`, `supabase stop`, `supabase status`, or ANY other supabase CLI command
  - ❌ DO NOT attempt to apply migrations, reset databases, or modify Supabase infrastructure
  - ❌ DO NOT try to start, stop, restart, or check status of Supabase services
  - ✅ ONLY create migration files when asked (never apply them)
  - ✅ ALWAYS ask the user to run Supabase commands if needed
  - 🔥 Supabase commands are DESTRUCTIVE and can wipe data, break services, or corrupt state
  - 🔥 This has been discussed multiple times - there are NO circumstances where you should run Supabase commands
  - 🔥 If you think a Supabase command is needed, STOP and ASK the user instead
- Never attempt to start or restart any services (supabase, dev servers, etc.). Assume all services are always running OR ask/tell the user if there is an issue.
- Always stay within the root directory of the project when running commands. Never cd into subdirectories or attempt to change files outside the root directory. Tell the user if something needs to be changed outside the root directory of the project. The root directory has the .git folder.

## Architecture & References

- Favor simple, relational SQL designs that keep data explicit in columns/tables. Avoid JSONB blobs or opaque patterns that obscure which fields are in use (e.g., for buffers or presets). Prioritize transparency and clarity in database design and code choices.
- Core tech stack includes React, TypeScript, shadcn/ui, Tailwind CSS, Supabase, Jotai, TanStack Router, TanStack Query (if needed), lucide-react, vitest, fullcalendar. Always look if shadcn/ui already has a component for the requested UI element. Do not modify the shadcn/ui components in src/components/ui directly. Import them as needed instead. Regular updates to shadcn/ui are expected and will erase any customizations. Notifications are driven with Sonner, not alert(), confirm(), etc.
- CRITICAL: ALWAYS consult APP_FILE_INDEX.md FIRST when working with the codebase to understand the file structure and avoid creating duplicate files or components. This document is your primary reference for the project's organization. Keep this file up-to-date as you add new files or move things around.
- CRITICAL: ALWAYS consult DB_STRUCTURE.md FIRST when working with the database to understand the existing tables, relationships, and schema. This document is your primary reference for the database structure. Keep this file up-to-date as you make changes to the database schema.
- The app supports both GraphQL and REST API calls, with Tanstack Query handling data fetching and caching. Decide based on the use case which approach is best suited. GraphQL is great for complex queries and reducing over-fetching, while REST can be simpler for straightforward operations.

**Policy:** Do **not** use `fetch` directly in frontend code; instead use **TanStack Query** with centralized API helpers to keep data fetching consistent, testable, and cacheable. The ESLint rule enforces this; server-side files under `supabase/**` are exempt and may use global `fetch` where necessary.
- Use noctare.log instead of console.log for logging in the frontend. This ensures that logs are captured in NoctareDevTools for better debugging and monitoring. ESList no-console erros means you must use noctare.log instead of console.log.
- Prefer backend code over db functions for business logic, as db functions obscure visibility and complicate testing.
- A save button means that the user must confirm their changes before they take effect. Changes should not be auto-saved unless explicitly stated. This means that the values are held in a temporary state until the user clicks "Save" or "Confirm". Or discarded if the user clicks "Cancel" or closes the modal without saving. This applies to modals such as the TaskModal or Settings.
- When ESLint reports that a file is too long, you must refactor the file into smaller components or modules. Do not increase the line limit or ignore the ESLint rule. Use creative but consistent names that reflect the purpose of the new components or modules.
- If you identify components that belong to just one component, group them together is a subfolder. For example, TaskModal and TaskModalBody should be in the same folder since TaskModalBody is only used by TaskModal.
- IMPORTANT: Avoid prop drilling. Use Jotai for state management instead. When in doubt, refactor to use Jotai atoms.
- Leave things better than you found them. If you spot any code smells, inefficiencies, or areas for improvement, take the initiative to refactor and enhance the codebase as you work on tasks.
- Run `pnpm lint` and solve any linting issues you find. If there are too many issues just run the command with `pnpm lint | head -n 10` to see a few at a time and not get overwhelmed. Do this until all error are resolved. You tend to leave a mess if `pnpm lint` is not run regularly.
- Unit tests: place them in a directory named `__tests__` next to the file being tested. Use .test.ts or .test.tsx suffix.
- API tests: place them in the tests/api/. We test against the actual API, no need to mock. Refer to the file tests/helpers/auth.ts for authenticating users in tests.
- The .history folder is used by vscode to store file history. Do not modify or delete this folder. This folder is not part of the codebase.
- CRITICAL: ALWAYS review APP_FILE_INDEX.md and DB_STRUCTURE.md at the beginning of each session to stay familiar with the project structure and database schema. These documents are your primary references and will help you avoid duplications and propose improvements effectively. Update them immediately when you introduce new files, components, database elements, or make changes to the codebase or database schema.
- Whenever scrolling is needed in a component, use `import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';` for consistent styling.
- This application is in pure development. There are no users, therefore anything can be changed without some "backwards-compatibility" concerns for some non-existent user base. YOU ARE ALWAYS welcome to suggest better approaches or libraries.
- I keep saying this but it is important: FRONTEND MUST BE LEAN & DUMB. Move business logic to the backend whenever possible. Keep client payloads minimal (send only the fields the backend truly needs) and let the server derive defaults, apply rules, and validate. If you spot logic in the frontend that belongs server-side, call it out and push it down. If you spot logic in the frontend that can be simplified by moving it to the backend, call it out and push it down. NO EXCEPTIONS. NO BUSINESS LOGIC IN THE FRONTEND. The day of tomorrow I should be able to switch to a different frontend framework with minimal changes to the backend, and without losing any business logic. That's the attitute: treat the frontend as a thin layer over the backend, that can be replaced at any time.
- Theming reminder: read THEMING.md before theming changes. Light is default, dark must be explicit. Ensure `data-theme` is set on `<html>` (ThemeProvider + ThemeWatcher). `--background/--foreground` must resolve to dark tokens in dark mode; check inheritance. Always add `dark:` variants for text/borders/backgrounds; don’t assume implicit dark defaults. Keep contrast high: bright text/icons/borders on dark surfaces, dark text on light surfaces. For FullCalendar, prefer tweaking `--fc-*` vars (including `--fc-today-*`) and target today cells/headers explicitly so overrides don’t erase highlights.

### Legacy Files Protocol (on request)
- Applies only to app code files under `./src` or `./supabase` with extensions `.ts` or `.tsx` (not test files).
- When asked to create legacy files, before modifying or deleting a file: (1) check for an existing legacy copy; (2) if none, copy the current file to `Filename.legacy.ext` (or a Legacy folder) without altering its contents; (3) leave legacy files untouched thereafter; (4) proceed with edits only in the active file.
- When an entire folder is renamed to `SomethingLegacy`, the files inside are treated as legacy by location; do not rename individual files inside that folder.

- DO NOT implement or “patch” backend responsibilities in the frontend. If something is missing server-side (scheduling trigger, validation, defaults, ordering, dependency/buffer rewrite, aggregation), STOP and push it to the backend. Document the gap (e.g., in API_CALLS.md) and avoid client-side orchestration/workarounds. When in doubt, rely on the backend, not the frontend; the app must work with any frontend.
- If a requested change would force frontend orchestration, refuse to do it in the client: note it in API_CALLS.md, propose/implement the backend fix instead, and keep the UI dumb.
