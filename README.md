# Starter Project

Lean starter built with React, Vite, TypeScript, shadcn/ui, TanStack Router/Query, Jotai, and a Supabase-ready client. Includes two sample pages (Dashboard and Components Showcase) to demonstrate theming, toasts, and basic UI primitives.

## Quick Start

```bash
pnpm install
pnpm dev
```

## What’s Included

- React + Vite + TypeScript
- shadcn/ui component library
- TanStack Router and Query wiring
- Jotai state management with demo atoms
- Supabase client scaffold (no migrations bundled)

## Docs to Read

- GENERAL_GUIDELINES.md — shared workflow, testing, and theming expectations
- .github/copilot-instructions.md — repository rules
- TODO.md — current task list
- AGENTS.md, CLAUDE.md, GEMINI.md, QWEN.md — agent-specific notes

## Contribution Notes

- Keep changes small and documented (update CHANGELOG.md for notable work)
- Prefer backend-driven logic; keep the frontend thin
- Add or update tests alongside feature changes; run `pnpm lint` before pushing
