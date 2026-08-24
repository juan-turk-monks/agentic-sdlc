---
issue: 12
status: planned
author: juan-turk-monks
---

# Implementation Plan: Interactive +1 button counter on the homepage

- Issue: #12
- Status: planned
- Date: 2026-08-24

## Overview

Replace the default `create-next-app` homepage content in `app/page.tsx` with
a single client-side counter button, centered on the page, that starts at 0
and increments its own displayed text by 1 on every click. Since no test
runner exists in the repository, first introduce a minimal Playwright
end-to-end setup (already an optional Next.js peer dependency) and prove the
behavior RED before implementing it, then GREEN afterward.

## Architecture Decisions

- Use Playwright (`@playwright/test`) for the automated behavior test because
  it is already referenced as an optional peer dependency of `next` in this
  repository, requires no framework changes, and drives the button exactly as
  a real user would (click + read rendered text) — an end-to-end/integration
  level appropriate for a UI interaction, per repository planning guardrails.
- Convert `app/page.tsx` into a `"use client"` component using `useState` for
  the counter, since this is the smallest change that satisfies interactivity
  without introducing new state-management dependencies.
- Remove all existing boilerplate markup rather than hiding it, to satisfy the
  issue's requirement that the homepage contain only one button.

## Task List

### Phase 1: Test infrastructure

#### T1: Add Playwright end-to-end test setup

- [x] Implement T1
- Description: Add `@playwright/test` as a devDependency, create a root
  `playwright.config.ts` that starts the app (`pnpm build && pnpm start`, or
  `pnpm dev`) on a test port and runs specs from `e2e/`, and install the
  required Playwright browser binaries.
- Acceptance criteria:
  - `pnpm exec playwright --version` succeeds.
  - `playwright.config.ts` exists at the repo root with a `webServer` entry
    pointing at the Next.js app and a `testDir` of `e2e`.
- Verification:
  - `pnpm install && pnpm exec playwright install --with-deps chromium`
  - `pnpm exec playwright test --list` runs without configuration errors
    (it may report zero tests at this point, since no spec exists yet).
- Dependencies: None
- Files likely touched: `package.json`, `pnpm-lock.yaml`, `playwright.config.ts`
- Estimated scope: S

#### T2: Write RED end-to-end test for the counter button

- [x] Implement T2
- Description: Add `e2e/counter.spec.ts` that navigates to the homepage,
  asserts exactly one `<button>` exists, asserts its initial text is `0`,
  asserts the text becomes `1` then `2` after one and two clicks respectively,
  and asserts the button's computed background color is `#1f883d` with white
  text. This test MUST fail against the current homepage (no such button
  exists), proving RED before implementation.
- Acceptance criteria:
  - Test file exists at `e2e/counter.spec.ts` and exercises exactly the
    behavior described in SPEC R3, R5, and R6.
  - Running the test against the unmodified `app/page.tsx` fails.
- Verification:
  - `pnpm exec playwright test e2e/counter.spec.ts` fails (RED), with failure
    output confirming the missing/incorrect button, not an environment error.
- Dependencies: T1
- Files likely touched: `e2e/counter.spec.ts`
- Estimated scope: XS

### Checkpoint: Test infrastructure

- [x] Required focused verification passes (T1 config loads; T2 fails as
      expected RED)
- [ ] Human review is complete before continuing when the SPEC requires it

### Phase 2: Counter button implementation

#### T3: Replace homepage content with a centered +1 counter button

- [x] Implement T3
- Description: Rewrite `app/page.tsx` as a `"use client"` component. Remove
  the existing Next.js/Vercel boilerplate (logo images, headline text,
  "Deploy Now"/"Documentation" links). Render a single container that centers
  its content both horizontally and vertically (e.g.
  `flex flex-1 items-center justify-center`) containing one `<button>` whose
  text is the current `count` state (initialized to `0`) and whose `onClick`
  handler increments `count` by 1 using `setCount((c) => c + 1)`. Style the
  button with Tailwind utilities `bg-[#1f883d] text-white` (background
  `#1f883d`, white text), per SPEC R6.
- Acceptance criteria:
  - `app/page.tsx` contains exactly one `<button>` element and no leftover
    boilerplate markup (SPEC R4, R5).
  - The button's text equals the counter value at all times and increments by
    exactly 1 per click (SPEC R1, R3).
  - The button is centered both horizontally and vertically on the page
    (SPEC R2).
  - The button's background color is `#1f883d` and its text color is white
    (SPEC R6).
- Verification:
  - `pnpm exec playwright test e2e/counter.spec.ts` passes (GREEN).
- Dependencies: T2
- Files likely touched: `app/page.tsx`
- Estimated scope: S

### Checkpoint: Counter button implementation

- [x] Required focused verification passes (`pnpm exec playwright test
      e2e/counter.spec.ts` is GREEN)
- [ ] Human review is complete before continuing when the SPEC requires it

### Phase 3: Full validation

#### T4: Run full lint, type-check, build, and e2e suite

- [x] Implement T4
- Description: Run the complete set of repository validation commands to
  confirm the change does not regress linting, type-checking, the production
  build, or the (currently single-file) Playwright suite.
- Acceptance criteria:
  - Lint, type-check, and build complete with no errors.
  - The full Playwright suite passes.
- Verification:
  - `pnpm lint`
  - `pnpm exec tsc --noEmit`
  - `pnpm build`
  - `pnpm exec playwright test`
- Dependencies: T3
- Files likely touched: none (verification only)
- Estimated scope: XS

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Playwright browser binaries fail to install in the CI/build sandbox (network or missing OS deps) | Medium | Use `playwright install --with-deps chromium` only (single browser) and document the exact command in T1; if install is blocked, follow the blocking protocol on the source issue instead of skipping automated coverage |
| `webServer` port conflicts with an already-running dev server during CI | Low | Configure `playwright.config.ts` with a dedicated test port and `reuseExistingServer: !process.env.CI` |
| Converting `app/page.tsx` to a client component unexpectedly affects other server-only behavior on the homepage | Low | The homepage currently has no server-only data fetching, so the conversion is safe; verified via `pnpm build` succeeding in T4 |
