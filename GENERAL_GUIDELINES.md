# General Guidelines

Shared practices we reuse across projects. Keep this short, opinionated, and current.

## Start Here
- Follow .github/copilot-instructions.md first; this file is a companion, not a replacement.
- Keep changes small, tested, and documented. Update TODO.md and CHANGELOG.md when work lands.
- Default to backend-driven logic; keep the frontend thin and presentation-focused.

## Setup
- Install deps: `pnpm install`
- Run dev server: `pnpm dev`

## Testing & Linting
- Use Vitest + Testing Library for React components.
- Unit tests live beside code in `__tests__` folders; API/integration tests go under `tests/api/`.
- Prefer behavior-first tests; avoid heavy mocking. Hit real APIs when feasible instead of faking them.
- Useful commands:
  - `pnpm test:file <path>` to run focused suites
  - `pnpm lint` to catch regressions early

## Theming (Light + Dark)
- Light is default; dark must be explicit. Ensure `data-theme` is set on `<html>` and tokens resolve in both modes.
- Use the palette and CSS variables in `src/index.css`; avoid hardcoded colors.
- Always provide `dark:` variants for text, borders, and surfaces. Verify contrast for headers, buttons, forms, and modals.

## Workflow Expectations
- Keep PRs/commits scoped. Remove dead code and stale docs as you go.
- Prefer composition over deep prop drilling; rely on shared state (e.g., Jotai atoms) when lifting state is unavoidable.
- When adding features, touch tests and docs in the same change. If you skip a test, explain why.
- Do not bypass auth or RLS-equivalent checks in code or tests; exercise the same pathways real users take.

## Documentation Hygiene
- Delete or trim obsolete docs quickly; this starter should stay lean.
- Point readers to living docs: this file, .github/copilot-instructions.md, README.md, TODO.md, CHANGELOG.md.
- If you introduce new architecture or schema, create a minimal doc and link it from here.
