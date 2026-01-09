# Auto Scheduling App — Active TODO

===

Files of interest. The files:
docs/00_Introduction.md
docs/01_Gatekeeper.md
docs/02_DependencyGraph.md
docs/03_DispatchQueue.md
docs/04_SchedulingLoop.md
describe how the smart scheduler works. Revise them at least once; you shoud be aware of this.

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
---


