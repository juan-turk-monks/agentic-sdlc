---
issue: 4
status: planned
author: juan-turk-monks
---

# Spec: Interactive counter page

- Issue: #4
- Status: draft
- Date: 2026-08-24

## Objective

Add a `/counter` route that renders a client-side counter starting at `0` with
a visible `+1` button. Each click increments the displayed value by one. This
is a micro feature intended to validate the end-to-end planning workflow
(issue → SPEC → tasks → PR) on a small, unambiguous piece of work. Success
means a user can navigate to `/counter`, see `0`, click `+1` three times, see
`3`, and reloading the page resets the value to `0`.

## Tech Stack

- Next.js 16.3.1 (App Router, `app/` directory)
- React 19.2.8 / React DOM 19.2.8
- TypeScript 5, strict mode
- Tailwind CSS 4 (via `@tailwindcss/postcss`)
- ESLint 9 with `eslint-config-next` (core-web-vitals + typescript configs)
- Package manager: pnpm 10.33.0

## Commands

- Install deps: `pnpm install`
- Dev server: `pnpm dev`
- Build: `pnpm build`
- Start (production): `pnpm start`
- Lint: `pnpm lint`

There is no test runner configured in this repository. Verification relies on
`pnpm build`, `pnpm lint`, and manual/keyboard interaction checks against the
dev server.

## Project Structure

- `app/layout.tsx` — root layout (server component), sets fonts and global
  html/body classes.
- `app/page.tsx` — existing root route, a server component.
- `app/globals.css` — global Tailwind styles.
- New route goes in `app/counter/page.tsx` following the App Router
  file-based routing convention (a folder under `app/` named after the route
  segment, containing a `page.tsx`).

## Code Style

Existing components are functional, default-exported, and typed with
TypeScript, e.g. `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      ...
    </div>
  );
}
```

Conventions to follow: default-exported function components, Tailwind
utility classes for styling (including `dark:` variants), no CSS modules or
styled-components. Since the counter needs interactivity (`useState`, click
handler), the new component must be a Client Component and start with the
`"use client"` directive, which is the one deviation from `page.tsx`
(a server component) required by this feature.

## Testing Strategy

No automated test framework exists in the repo. Verification is:

1. Static checks: `pnpm lint` and `pnpm build` (type-checks and bundles the
   new route) must pass.
2. Manual verification via `pnpm dev`, navigating to `/counter`:
   - Initial render shows `0`.
   - Clicking `+1` three times shows `3`.
   - The button is reachable and activatable via keyboard (Tab to focus,
     Enter/Space to activate) — a native `<button>` element satisfies this
     without extra ARIA work.
   - Reloading the page resets the value to `0` (no persistence).

## Boundaries

- Always: keep the change confined to the new `/counter` route and its
  directly required component(s); use a native `<button>` for the increment
  control; keep state local to the client component via `useState`.
- Ask first: any change to shared files (`app/layout.tsx`, `app/globals.css`,
  `package.json`) beyond what strict necessity requires for this route to
  render correctly.
- Never: add a database, API route, authentication, new dependencies, or any
  persistence (localStorage, cookies, server state) for the counter value;
  add a decrement/reset button; add cross-tab or cross-user sync.

## Technical Design

- R1: The app MUST expose a route at `/counter` via `app/counter/page.tsx`.
- R2: The counter component MUST be a Client Component (`"use client"`)
  because it uses `useState` and a click handler, per Next.js App Router
  rules for interactivity.
- R3: The component MUST initialize state to `0` and render it as visible
  text on the page.
- R4: The page MUST render a `<button>` with visible text `+1`.
- R5: Clicking the button MUST increment the displayed count by exactly `1`
  per click, with no upper bound imposed by the requirements.
- R6: The counter state MUST NOT be persisted anywhere (no storage API, no
  server round-trip); a full page reload MUST show `0` again, satisfied
  naturally by keeping the value in React component state only.
- R7: The button MUST be operable via keyboard, satisfied by using a native
  `<button>` element (default focusable and activatable with Enter/Space),
  without requiring custom `tabIndex` or key handlers.
- R8: No other files, routes, dependencies, or unrelated behavior may be
  changed to implement this feature.

## Success Criteria

- Visiting `/counter` renders `0` (R3).
- The `+1` button is visible with that exact label (R4).
- Three sequential clicks update the rendered value to `3` (R5).
- Reloading `/counter` shows `0` again (R6).
- Tabbing to the button and pressing Enter or Space increments the counter
  (R7).
- `pnpm lint` and `pnpm build` complete without errors after the change.
- No new dependencies are added to `package.json`; no database, API route,
  or auth code is introduced (R8).
