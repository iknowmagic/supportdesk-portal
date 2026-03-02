# InboxHQ Support Desk Portal - Portfolio Content Pack

## Ready Check
- This file is ready to hand to another AI for website implementation.
- Structure is split into short card copy, full case-study copy, screenshot script, and palette reference.
- Private guidance is included in `[ ... ]` notes only.

[Use this exact file as source content. Tell the other AI: "Use public text as-is, ignore bracketed notes unless needed for strategy."]

---

## Instructions for Intermediary AI (Website Builder)

### Primary Goal
- Convert this content into a polished portfolio project page on my website.
- Keep tone professional, concise, and technically grounded.
- Create a dedicated project detail page for InboxHQ and add a link to it from the website home page portfolio/projects section.

### Content Rules
- Treat non-bracketed text as canonical project content.
- Treat bracketed notes (`[ ... ]`) as strategy hints for editing decisions.
- Do not invent metrics, timelines, user counts, or business impact.
- Do not add technologies that are not listed in this file.
- Keep technical claims aligned with provided sections.

### Page Composition Rules
- Build both:
1. A portfolio card/listing snippet (title, one-liner, stack tags).
2. A full project detail page/case-study layout.
- Keep section order generally aligned with this file unless layout constraints require minor reordering.
- Include clear screenshot slots/placeholders that map to the "Screenshot Script" sequence.
- Add meaningful `alt` text for each screenshot slot.

### Screenshot Handling
- Use this placeholder convention so I can replace assets quickly:
  - `{{INBOXHQ_SHOT_01_LOGIN}}`
  - `{{INBOXHQ_SHOT_02_INBOX}}`
  - `{{INBOXHQ_SHOT_03_SEARCH_SUGGESTIONS}}`
  - `{{INBOXHQ_SHOT_04_SEARCH_HISTORY}}`
  - `{{INBOXHQ_SHOT_05_NEW_TICKET_MODAL}}`
  - `{{INBOXHQ_SHOT_06_TICKET_DETAIL}}`
  - `{{INBOXHQ_SHOT_07_DASHBOARD}}`
  - `{{INBOXHQ_SHOT_08_MOBILE}}`
  - `{{INBOXHQ_SHOT_09_DARK_THEME}}`
- If placeholders need real URLs in markup, use `https://picsum.photos/200/300` and adjust width/height per layout as needed.
- Keep image containers stable (avoid layout shift) so I can swap real screenshots later without redesigning the page.

### Design Direction
- Favor a clean, high-contrast editorial layout.
- Prioritize readability over decorative effects.
- Reflect the product palette direction from the token section.
- Keep typography modern and legible with clear heading/body contrast.
- Include a small "style guide" section on the project page that visibly showcases:
  - key palette swatches from this document
  - typography treatment used on the page (headline style + body style + small label style)

### Required Asset Usage
- Use `/inboxhq-badge-logo.png` (from `public/`) as the project badge/logo on the project page.
- Reuse the same badge/logo in the homepage project card if it fits the existing layout.

### Process Framing Requirement
- Include a concise statement that the project was "vibe coded under my direction" and clarify that product direction, UX/UI decisions, and implementation guidance were led intentionally.
- Keep this framing professional and process-oriented, not defensive.

### Output Requirements
- Return:
1. Final page copy (ready to publish).
2. Any required structured content blocks/components (if my site uses blocks/sections).
3. A short list of places where I must swap image placeholders.
4. A clear note of which home page file/component was updated to add the project link.

[If your website has a specific CMS/component format, paste that schema to the AI together with this file.]

---

## Portfolio Card Copy (Short Version)

### Project Title
InboxHQ Support Desk Portal

### One-Liner
A modern support desk web app focused on fast ticket triage, clear workflows, and consistent UI across desktop and mobile.

### Short Description
InboxHQ is a ticketing portal I built with React, TypeScript, Supabase, and TanStack Query. It includes inbox triage, ticket detail workflows, analytics dashboards, responsive navigation, and light/dark theming with a tokenized design system.

### Stack Tags
React, TypeScript, Supabase, TanStack Query, Tailwind CSS, shadcn/ui

[If your portfolio card has strict length limits, keep only "One-Liner" + stack tags.]

---

## Full Portfolio Page Copy

### Overview
InboxHQ is a support desk portal built to simulate realistic daily support operations. The project emphasizes clear hierarchy, rapid scanning, and low-friction actions across inbox management, ticket detail handling, and dashboard reporting.

### Process Note
This project was vibe coded under my direction: I defined the product goals, UX/UI decisions, technical constraints, and review loop, then iterated implementation quickly using AI assistance.

### What I Built
- Inbox workflow with filtering, search suggestions, and ticket history recall.
- Ticket detail workflow with conversation thread, assignee/status updates, and quick actions.
- Ticket creation modal with responsive dialog/drawer behavior depending on screen size.
- Analytics dashboard with KPI cards and visual breakdowns (volume, priority mix, assignee workload).
- Robust UX states for loading, empty, and error scenarios.

### Frontend Architecture
- React + TypeScript with route-level structure via TanStack Router.
- Server-state management using TanStack Query for caching and invalidation.
- Global UI state via Jotai atoms for lightweight, targeted state control.
- Reusable primitives from shadcn/ui customized through design tokens.

### UI/UX Decisions

#### Palette
- A neutral-first light theme supports dense support workflows without visual fatigue.
- A high-contrast dark theme is explicitly tokenized for readability and consistency.
- Semantic tokens (`--background`, `--foreground`, `--border`, `--primary`, `--chart-*`) keep styles consistent across components and views.
- Status/priority meaning is reinforced in badges, chart colors, and accents.

#### Typography
- System-sans style approach for strong performance and broad rendering consistency.
- Hierarchy relies on weight + scale: prominent page titles, compact metadata, muted supporting text.
- Uppercase micro-labels and tabular numerals improve scanability in operational UI contexts.

#### Layout
- Centered app frame (`max-w-5xl`) with fixed/sticky header to anchor orientation.
- Card-driven content structure for clarity and predictable spacing.
- Responsive behavior across breakpoints for navigation, grids, and modal interactions.
- Desktop ticket detail uses a two-column structure (context + action panel) for efficient task flow.

### Interaction Highlights
- Sticky header with active-page indicators.
- Mobile menu fallback for primary navigation.
- Search with live suggestions + history + keyboard navigation.
- Skeleton loading patterns to reduce perceived latency.
- Toast feedback for success/error user actions.
- Subtle route transitions for continuity.

### Quality and Reliability
- Error and retry states across major data surfaces (inbox, dashboard, ticket detail).
- Component and API test coverage for key ticketing and dashboard flows.
- Linting and type-checking integrated into standard workflow.

[If asked for "biggest engineering decision", mention: data-fetching consistency via centralized API helpers + TanStack Query, and token-driven theming for scalable UI consistency.]

---

## Screenshot Script (Capture in This Order)

### 1. Login
- Capture centered "InboxHQ Demo" sign-in view.
- Include icon, form, and reset notice.
- Purpose: visual tone + entry point.

### 2. Inbox Overview
- Capture full inbox with top header, filters, and multiple ticket cards.
- Purpose: information hierarchy and triage-focused layout.

### 3. Search Suggestions
- Type in search input and capture suggestions dropdown.
- Purpose: advanced interaction beyond simple filter controls.

### 4. Search History
- Clear input and refocus to show history dropdown.
- Purpose: stateful UX and workflow efficiency.

### 5. New Ticket Modal
- Open "New Ticket" and capture full form fields + action buttons.
- Purpose: form design and task-completion flow.

### 6. Ticket Detail
- Capture two-column detail layout with conversation + actions panel visible.
- Purpose: depth of workflow and action density.

### 7. Dashboard
- Capture KPI cards and all three charts on dashboard.
- Purpose: product breadth and data visualization quality.

### 8. Mobile Responsive
- Use mobile viewport (recommended: 390x844) and capture adapted header/nav layout.
- Purpose: responsive implementation proof.

### 9. Dark Theme
- Toggle to dark mode and capture either inbox or dashboard.
- Purpose: explicit theme support and contrast quality.

[Use 6-8 images on the final page. If reducing, keep: Inbox, Ticket Detail, Dashboard, Mobile, Dark Theme.]

---

## Caption Bank (Copy/Paste)
- "Inbox triage interface designed for fast scanning and low-friction ticket routing."
- "Ticket detail view combining conversation context with immediate operational actions."
- "Dashboard analytics summarizing ticket volume, priority distribution, and assignee workload."
- "Token-driven UI system with explicit light/dark theme behavior."
- "Responsive support workflow that scales from desktop to mobile."

[If your portfolio format allows "Impact", pair each caption with a practical outcome statement.]

---

## Palette Reference (Exact Tokens Used)

### Light Base Tokens
- `--light-mine-shaft: oklch(0.239 0 89.876)`
- `--light-wild-sand: oklch(0.97 0 89.876)`
- `--light-silver-chalice: oklch(0.757 0 89.876)`
- `--light-white: oklch(1 0 89.876)`
- `--light-alto: oklch(0.885 0 89.876)`
- `--light-destructive: oklch(0.72 0.16 24)`

### Dark Base Tokens
- `--dark-pickled-bluewood: oklch(0.353 0.041 250.363)`
- `--dark-pickled-bluewood-mid: oklch(0.401 0.044 248.985)`
- `--dark-oslo-gray: oklch(0.633 0.015 202.368)`
- `--dark-cinnabar: oklch(0.632 0.193 29.71)`
- `--dark-buttercup: oklch(0.836 0.169 91.787)`

### Chart Tokens (Light)
- `--light-chart-1: oklch(0.62 0.16 255)`
- `--light-chart-2: oklch(0.72 0.14 160)`
- `--light-chart-3: oklch(0.78 0.16 95)`
- `--light-chart-4: oklch(0.67 0.18 30)`
- `--light-chart-5: oklch(0.62 0.12 310)`

### Chart Tokens (Dark)
- `--dark-chart-1: oklch(0.78 0.16 255)`
- `--dark-chart-2: oklch(0.76 0.13 160)`
- `--dark-chart-3: oklch(0.82 0.16 95)`
- `--dark-chart-4: oklch(0.76 0.18 30)`
- `--dark-chart-5: oklch(0.72 0.13 310)`

[If needed, ask me for a HEX conversion table for these tokens so you can use them in Figma or static CSS snippets.]

---

## Tech Stack (Expanded)
- React
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- Jotai
- Supabase
- Tailwind CSS
- shadcn/ui
- Recharts
- Framer Motion

[For concise versions, use only: React, TypeScript, Supabase, TanStack Query, Tailwind CSS.]
