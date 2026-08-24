---
issue: 6
status: planned
author: juan-turk-monks
---

# Spec: Add counter

- Issue: #6
- Status: draft
- Date: 2026-08-24

## Objective

Add an interactive counter to the app's home page so a visitor can increment
and decrement a numeric value entirely on the client, with no backend or
persistence. This gives the project's first piece of interactive UI and a
concrete, testable component to validate the app's React/Next.js setup.
Success is a visible counter on `/` that starts at 0, increases on one
button, decreases on another, and updates immediately without a full page
reload.

## Tech Stack

- Next.js 16.3.1 (App Router, `app/` directory)
- React 19.2.8 / React DOM 19.2.8
- TypeScript 5, strict mode (`tsconfig.json`)
- Tailwind CSS 4 (via `@tailwindcss/postcss`) for styling
- ESLint 9 with `eslint-config-next` (core-web-vitals + typescript configs)
- Package manager: pnpm 10.33.0 (`pnpm-workspace.yaml` present)

This Next.js version has breaking changes versus the training-data version.
Before writing component code, consult `node_modules/next/dist/docs/` (once
dependencies are installed) for current App Router / client component
conventions, per `AGENTS.md`.

## Commands

- Install dependencies: `pnpm install`
- Dev server: `pnpm dev`
- Build: `pnpm build`
- Start (production): `pnpm start`
- Lint: `pnpm lint`

No test runner is currently configured in `package.json`. This change does
not introduce one; verification relies on lint, build, and manual/dev-server
checks (see Testing Strategy).

## Project Structure

- `app/page.tsx` — home page (Server Component today); will render the new
  counter.
- `app/layout.tsx` — root layout, wraps all pages.
- `app/globals.css` — global Tailwind styles.
- `public/` — static assets.
- `types/` — ambient type declarations.
- New: `app/components/Counter.tsx` — the counter Client Component.

## Code Style

Existing components use function declarations with a default export, typed
props via Next.js generated helper types (e.g. `LayoutProps<"/">` in
`app/layout.tsx`), and Tailwind utility classes directly in JSX for styling
(see `app/page.tsx`, e.g. `className="flex h-12 w-full items-center..."`).
New code should follow the same pattern: a typed functional component,
Tailwind classes for layout/spacing/color (including `dark:` variants to
match the existing dark-mode support), and no CSS modules or styled-components.

## Testing Strategy

- No automated test framework exists in this repository; do not add one for
  this change.
- Validate via:
  - `pnpm lint` — must pass with no new errors/warnings.
  - `pnpm build` — must complete successfully (validates TypeScript types
    and the Client/Server Component boundary).
  - Manual check with `pnpm dev`: load `/`, confirm the counter renders at
    0, and that increment/decrement buttons update the displayed value
    without a full page reload.

## Boundaries

- Always: keep the counter state fully client-side (no server round trip,
  no persistence layer); follow existing Tailwind styling conventions
  including dark-mode variants; keep the change scoped to the home page and
  a new counter component.
- Ask first: any change to global layout structure, introduction of new
  dependencies (state libraries, testing frameworks), or persistence (e.g.
  local storage, database) beyond an in-memory counter.
- Never: modify unrelated existing UI content beyond what is needed to place
  the counter; add a backend API route for this feature; remove the default
  Next.js starter content unless explicitly required to make room for the
  counter.

## Technical Design

The counter is implemented as a new Client Component so it can hold
interactive `useState`, since `app/page.tsx` currently has no `"use client"`
directive and Next.js Server Components cannot use hooks.

- R1: The system MUST provide a `Counter` component at
  `app/components/Counter.tsx`, marked with `"use client"`, that manages an
  integer count via `useState`, initialized to 0.
- R2: The `Counter` component MUST render the current count value and two
  buttons: one to increment the count by 1, one to decrement the count by 1.
- R3: The count MAY go negative (no lower bound) unless the issue author
  requests otherwise later; there is no stated upper/lower bound requirement.
- R4: `app/page.tsx` MUST render the `Counter` component so it is visible on
  the home page, without converting `page.tsx` itself into a client
  component (import and use the client component as a child).
- R5: Counter styling MUST use Tailwind utility classes consistent with the
  existing page (including `dark:` variants) so it visually matches the
  rest of the UI.
- R6: The implementation MUST NOT introduce a backend endpoint, persistence,
  or global state management library; state is local to the component
  instance.

## Success Criteria

- `pnpm lint` passes with no new issues (R1, R2, R4).
- `pnpm build` completes successfully (R1, R4, R6).
- Loading `/` in the dev server shows a counter starting at 0 (R1).
- Clicking the increment button increases the displayed value by 1 each
  click; clicking decrement decreases it by 1 each click; no page reload
  occurs (R2, R3).
- `app/page.tsx` renders the `Counter` component and remains a Server
  Component itself (only `Counter.tsx` carries `"use client"`) (R4).
