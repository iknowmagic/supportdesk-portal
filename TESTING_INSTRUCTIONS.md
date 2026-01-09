# Testing Instructions

- Keep tests behavior-focused. Use Vitest plus Testing Library for React components.
- Place unit tests in __tests__ next to source files; put API or integration coverage under tests/api/.
- Avoid heavy mocking. Hit real APIs when practical; if a scenario demands extensive setup or mocks, document the gap and move on.
- Commands: pnpm test:file <path> for focused runs; pnpm lint before shipping.
- See GENERAL_GUIDELINES.md and .github/copilot-instructions.md for the full workflow and expectations.
