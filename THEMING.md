# Theming Notes

- Light is the default; add dark variants explicitly. Ensure data-theme is set on <html> and tokens in src/index.css resolve in both modes.
- Use palette variables instead of hardcoded colors. Provide dark text/border/background overrides for UI elements.
- Verify contrast for headers, buttons, forms, and modals before shipping.
- See GENERAL_GUIDELINES.md for the current theming checklist.
