---
name: code-writing
description: To use when writing code, to prevent duplication of code, dirty code, untested code, duplication of efforts. 
---

# Code writing workflow

To write better code by preventing duplication of efforts, broken code, untested code, etc.

## When to Use

Trigger anytime you are writing code.

## Stage 1: Context Gathering

Ensure that you read what this project intends to do in APP.md. Revise DB_STRUCTURE.md to understand how the DB schema works. Revise APP_FILE_INDEX.md to understand what's in the code. Also check package.json to understand what libraries this project uses. I use vite, vitest, shadcn, tailwind, react, Tanstack Query, Tanstack Routes (programmatic routes, not file routes), supabase for DB storage and Edge functions (avoid RPC-style API calls, including user_id in the calls, or the use of triggers; favor Edge functions and not triggers as much as possible).

The logic goes to the backend, not the frontend. Aim to create a dumb frontend. I should be able to change frontend implementations without losing logic. AGAIN, VERY IMPORTANT: KEEP THE LOGIN IN THE BACKEND AS MUCH AS POSSIBLE. Do not opt for "cheap", quick solutions that favor frontend logic when the backend can and should carry the logic of the app.

All app data access must go through Edge functions. Do not call Supabase REST, GraphQL, RPC, or `supabase.from(...)` directly from frontend code.

When creating migration files, pause and wait for the user to apply them before continuing.

## Stage 2: Ensure a clean environment before starting

Run `pnpm lint:file` and revise the resulting file  ./tmp/lint-errors.txt. Solve ALL lint errors to ensure you start with a clean environment.

Run `pnpm test:failing-files`. This will give you a list of the failing test files. THEN run `pnpm test:file <file-name>` - if the file is named ComponentName.test.tsx for example, `pnpm test:file ComponentName` is enough. Then revise ./tmp/test-output.json, solve the problems and do this for each failing file sequentially.

IMPORTANT: Consider both the code and the test. Sometimes the code may be wrong. You have to determine if the test is reflecting the functionality needed and not just try at all costs to make the tests pass as if the code is perfect and well-functioning because often it is not.

Run `pnpm duplicates:report` and revise the resulting file ./tmp/jscpd-report.json to see if there is any duplicated code and consolidate such duplicated code into a single place; choose the most simple, straightforward naming convention; MyFunction vs ThisIsTheFunctionThatDoesThis should favor the former.

## Stage 3: Preprare to code

Embrace KISS principles. When unsure PAUSE and ask for clarification if needed. DO NOT GUESS. 

## Stage 4: Write the code needed

Write the code needed to complete the task. Look at the TODO.md and see what is the next thing that is needed. Check off the task when done.

## Stage 5: Check lint

Run `pnpm lint:file` and revise the resulting file  ./tmp/lint-errors.txt. Solve ALL lint errors to ensure you end with a clean environment.

## Stage 6: Write tests

Write tests that prove that what you did actually works. Use the actual API; the same API that the end user would use. Use temp users to avoid race conditions (see ./tests/helpers/auth.ts). Check ./tests/helpers/auth.ts and ./tests/api/auth.test.ts (sample passing test)
