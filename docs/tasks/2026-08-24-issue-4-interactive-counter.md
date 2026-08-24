---
issue: 4
status: planned
author: juan-turk-monks
---

# Implementation Plan: Interactive counter page

- Issue: #4
- Status: planned
- Date: 2026-08-24

## Overview

Add a single new App Router route, `app/counter/page.tsx`, containing a
Client Component that renders a `0`-initialized counter and a `+1` button.
Clicking the button increments local React state by one; no persistence,
extra dependencies, or unrelated files are touched. The work is small enough
to be a single implementation phase followed by a verification checkpoint.

## Architecture Decisions

- Use a single Client Component file (`app/counter/page.tsx`) rather than
  splitting the button and counter into separate components, since the
  feature is a single cohesive interactive element with no reuse need.
- Use `useState` for local state; no context, store, or persistence layer,
  per the issue's explicit "no persistence" requirement.
- Reuse existing Tailwind utility conventions (from `app/page.tsx`) for
  layout and dark-mode support instead of introducing new styling patterns.

## Task List

### Phase 1: Implement the counter route

#### T1: Create the `/counter` page component

- [ ] Implement T1
- Description: Create `app/counter/page.tsx` as a Client Component
  (`"use client"` directive) that holds an integer count in `useState`
  initialized to `0`, renders the current count as visible text, and renders
  a native `<button>` labeled `+1` whose `onClick` handler increments the
  count by one.
- Acceptance criteria:
  - Visiting `/counter` shows `0` on first render.
  - The button is visible and its text is exactly `+1`.
  - Clicking the button three times updates the displayed value to `3`.
  - Reloading the page shows `0` again (state is not persisted anywhere).
  - The button is a native `<button>` element, so it is reachable via Tab
    and activatable with Enter/Space without extra code.
  - No dependencies are added to `package.json`; no other files under `app/`
    are modified.
- Verification:
  - `pnpm build` completes without type or build errors.
  - `pnpm dev`, then manually visit `http://localhost:3000/counter` and
    click `+1` three times, confirm `3` is shown, then reload and confirm it
    resets to `0`.
- Dependencies: None
- Files likely touched: `app/counter/page.tsx`
- Estimated scope: XS

### Checkpoint: Route implemented and verified

- [ ] Required focused verification passes (`pnpm build` and manual
  `/counter` check as described in T1's verification steps)
- [ ] `pnpm lint` passes with no new warnings/errors introduced by the new
  file

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Forgetting the `"use client"` directive causes a build/runtime error because `useState`/`onClick` require a Client Component in the App Router | Medium | Add the directive as the first line of `app/counter/page.tsx`; verified by `pnpm build` succeeding |
| Accidentally editing shared files (`layout.tsx`, `globals.css`, `package.json`) while wiring up styles | Low | Keep all markup and styles self-contained in the new `app/counter/page.tsx` file; review `git diff` before commit to confirm only the new file is added |
