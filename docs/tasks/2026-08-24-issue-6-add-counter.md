---
issue: 6
status: planned
author: juan-turk-monks
---

# Implementation Plan: Add counter

- Issue: #6
- Status: planned
- Date: 2026-08-24

## Overview

Implement a small, self-contained interactive counter for the home page.
Work proceeds in two phases: first build and style the `Counter` client
component in isolation, then wire it into `app/page.tsx` and verify the full
app builds, lints, and behaves correctly in the dev server.

## Architecture Decisions

- Isolate interactivity in a new Client Component (`app/components/Counter.tsx`)
  rather than converting `app/page.tsx` to a client component, keeping the
  page itself a Server Component per Next.js App Router conventions.
- Use local `useState` for count state; no external state library or
  persistence, matching the issue's minimal scope.
- Reuse existing Tailwind utility-class conventions (including `dark:`
  variants) instead of introducing new stylesheets or CSS modules.

## Task List

### Phase 1: Build the Counter component

#### T1: Create the Counter client component

- [x] Implement T1
- Description: Add `app/components/Counter.tsx` as a `"use client"`
  component that holds an integer count in `useState` (initialized to 0)
  and renders the current value plus increment and decrement buttons that
  update the state on click.
- Acceptance criteria:
  - File starts with the `"use client"` directive.
  - Component exports a default function component named `Counter`.
  - Clicking increment increases displayed count by 1; clicking decrement
    decreases it by 1; no bounds are enforced.
  - Styling uses Tailwind utility classes consistent with `app/page.tsx`
    (including `dark:` variants).
- Verification:
  - `pnpm lint` passes for the new file.
  - Manual visual check once wired into the page in T2.
- Dependencies: None
- Files likely touched: `app/components/Counter.tsx`
- Estimated scope: S

### Checkpoint: Component ready

- [x] Required focused verification passes (`pnpm lint` on new file)
- [ ] Human review is complete before continuing when the SPEC requires it

### Phase 2: Integrate and verify

#### T2: Render Counter on the home page

- [x] Implement T2
- Description: Import and render `Counter` inside `app/page.tsx`, placed
  within the existing layout so it displays alongside (or in place of) the
  current starter content, without adding a `"use client"` directive to
  `page.tsx` itself.
- Acceptance criteria:
  - `app/page.tsx` remains a Server Component (no `"use client"` at the top
    of the file).
  - `Counter` is visible when the page renders.
- Verification:
  - `pnpm build` completes successfully.
  - `pnpm dev` manual check: load `/`, confirm counter starts at 0 and
    responds to increment/decrement clicks without a full page reload.
- Dependencies: T1
- Files likely touched: `app/page.tsx`
- Estimated scope: XS

#### T3: Full verification pass

- [ ] Implement T3
- Description: Run the repository's lint and build commands end-to-end to
  confirm the change integrates cleanly with no regressions.
- Acceptance criteria:
  - `pnpm lint` reports no new errors or warnings.
  - `pnpm build` succeeds with no type errors.
- Verification:
  - `pnpm lint`
  - `pnpm build`
- Dependencies: T2
- Files likely touched: none (verification only)
- Estimated scope: XS

### Checkpoint: Feature complete

- [ ] Required focused verification passes (`pnpm lint`, `pnpm build`)
- [ ] Human review is complete before continuing when the SPEC requires it

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Next.js 16 App Router conventions differ from trained knowledge, causing incorrect Client/Server Component boundaries | Medium | Consult `node_modules/next/dist/docs/` per `AGENTS.md` before implementing; keep `page.tsx` server-only and isolate hooks in `Counter.tsx` |
| No test framework exists to catch regressions automatically | Low | Rely on `pnpm lint` + `pnpm build` plus a manual dev-server check as defined verification steps |
| Placement of the counter could unintentionally remove desired starter content | Low | Keep changes additive to `app/page.tsx`; only add the `Counter` element, do not delete unrelated sections unless necessary |
