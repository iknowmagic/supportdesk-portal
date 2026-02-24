# InboxHQ Support Desk Portal

## Project Summary
InboxHQ is a support desk web app built to simulate a realistic ticket workflow for a single demo user. It focuses on clarity, speed, and predictable interactions across inbox triage, ticket detail, and performance analytics.

[Use this as your short intro paragraph in your portfolio card. Keep it to 2-3 lines on the main listing page, then expand below in the project detail page.]

## What I Built
- Built a full ticketing flow: inbox, ticket detail, reply, assignment, status updates, and ticket creation.
- Implemented authenticated data access with Supabase-backed endpoints and frontend data caching via TanStack Query.
- Added resilient UI states across loading, empty, and error scenarios.
- Shipped a responsive layout with desktop and mobile navigation patterns, plus dark/light theme support.

[If your portfolio has a "My Role" section, use first person: "I designed and implemented..." and keep this section as bullets.]

## UI Decisions

### Palette
- Light theme defaults to a neutral, low-noise grayscale palette ("Monochrome Elegance") for focus-heavy support workflows.
- Dark theme uses a cooler, higher-contrast palette ("Gothic Cyber") with explicit token overrides for text, borders, cards, forms, dialogs, and charts.
- Semantic tokens power consistency (`--background`, `--foreground`, `--border`, `--primary`, `--chart-*`) so component styling stays coherent across pages.
- Priority and status cues are encoded through badge variants and chart tokens to keep visual meaning consistent.

[If a recruiter asks "why this palette?", say: "I optimized for dense operational UI readability over brand-heavy color usage."]

### Typography
- Used a clean system sans stack (no heavy custom font dependency) to keep rendering fast and legible.
- Established clear hierarchy with weight and size: strong page titles (`text-2xl` / `text-3xl`), compact metadata (`text-sm` / `text-xs`), and muted secondary copy.
- Used uppercase tracking and compact labels in metadata rows to separate labels from values quickly.
- Applied tabular numerals in time-sensitive UI (reset countdown) for stable number alignment.

[If you want to sound more design-oriented: "Typography favors operational scanning: high-contrast headers, muted metadata, and compact controls."]

### Layout
- Built around a centered app frame (`max-w-5xl`) with a fixed top header to anchor navigation.
- Main content uses card-based sections and responsive grids (`sm`, `md`, `lg`) for progressive density.
- Inbox emphasizes scanability: top summary, quick filters, then vertically stacked ticket cards with badges.
- Ticket detail uses a two-column desktop split (content + actions/context) and collapses cleanly on smaller screens.
- Modal creation flow uses dialog on desktop and drawer on mobile for ergonomic input handling.

[In interview walkthroughs, emphasize that layout choices map directly to support-agent tasks: triage, inspect, act, and return.]

## Interaction and UX Highlights
- Sticky header with active route indicators and mobile hamburger fallback.
- Search input supports history plus live suggestions with keyboard navigation.
- Toast feedback for user actions and errors.
- Skeleton loaders to prevent layout shift and improve perceived performance.
- Smooth route transitions (`framer-motion`) for continuity.

## Suggested Screenshot Plan

### 1) Login
- Capture the centered "InboxHQ Demo" login view with icon, clean form, and reset notice.
- Goal: show first impression and visual tone.

### 2) Inbox Overview
- Capture full inbox page with header, filters, and several ticket cards visible.
- Goal: show information hierarchy and card system.

### 3) Search Experience
- Type in search and capture suggestions dropdown.
- Then clear input and capture history dropdown.
- Goal: show advanced UX beyond static filtering.

### 4) New Ticket Modal
- Open "New Ticket" modal and capture all key fields in one shot.
- Goal: show form design quality and task completion flow.

### 5) Ticket Detail
- Capture the two-column ticket detail view with conversation thread and action panel.
- Goal: show depth of workflow and detail handling.

### 6) Dashboard Analytics
- Capture dashboard cards + charts ("Ticket volume", "Priority mix", "Assignee workload").
- Goal: show data visualization and product breadth.

### 7) Mobile Responsive State
- Use responsive viewport (for example 390x844) and capture header with hamburger menu and adapted layout.
- Goal: prove responsive behavior, not just desktop polish.

### 8) Dark Theme
- Switch to dark theme from user menu and capture either inbox or dashboard.
- Goal: show explicit theming support and contrast decisions.

[Use 6-8 screenshots max on the portfolio page. Lead with Inbox Overview, then Ticket Detail, then Dashboard.]

## Caption Templates (Copy/Paste)
- "Inbox triage view with quick status scanning and contextual ticket metadata."
- "Ticket detail layout balancing conversation context and immediate actions."
- "Analytics dashboard surfacing ticket trends and workload distribution."
- "Theme-aware UI system with explicit light/dark token mapping."
- "Responsive support workflow from desktop to mobile."

[Pair each caption with one measurable outcome if possible, even if project-level, such as "reduced clicks to update status" or "faster triage flow".]

## Tech Stack (Portfolio Friendly)
- React
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- Jotai
- Supabase
- Tailwind CSS + shadcn/ui
- Recharts
- Framer Motion

[If your portfolio card has limited space, list only: React, TypeScript, Supabase, TanStack Query, Tailwind.]
