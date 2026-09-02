---
issue: 15
status: planned
author: juan-turk-monks
---

# Implementation Plan: Update homepage title to "Agentic SLDC"

- Issue: #15
- Status: planned
- Date: 2026-09-02

## Overview

Change the document title exported from `app/layout.tsx`'s `metadata` object
from the default "Create Next App" to "Agentic SLDC", proven by a focused
Playwright end-to-end test added alongside the existing `e2e/counter.spec.ts`
suite.

## Architecture Decisions

- Reuse the existing Playwright end-to-end setup (already installed and
  configured in this repository) rather than introducing a new test runner,
  since it already covers homepage behavior (`e2e/counter.spec.ts`).
- Change only the `title` field of the `metadata` export in `app/layout.tsx`;
  no new components, routes, or metadata fields are introduced.

## Task List

### Phase 1: Title change with RED/GREEN e2e coverage

#### T1: Write RED end-to-end test for the homepage title

- [x] Implement T1
- Description: Add `e2e/title.spec.ts` that navigates to the homepage (`/`)
  and asserts the document title equals "Agentic SLDC" using Playwright's
  `toHaveTitle` matcher. This test MUST fail against the current
  `app/layout.tsx` (title is still "Create Next App"), proving RED.
- Acceptance criteria:
  - Test file exists at `e2e/title.spec.ts`.
  - Running it against the unmodified `app/layout.tsx` fails.
- Verification:
  - `pnpm exec playwright test e2e/title.spec.ts` fails (RED), with failure
    output showing the actual title "Create Next App" vs. expected
    "Agentic SLDC".
- Dependencies: None
- Files likely touched: `e2e/title.spec.ts`
- Estimated scope: XS

#### T2: Update the metadata title in `app/layout.tsx`

- [ ] Implement T2
- Description: Change `metadata.title` in `app/layout.tsx` from
  `"Create Next App"` to `"Agentic SLDC"`, leaving `description` and all
  other layout code unchanged.
- Acceptance criteria:
  - `app/layout.tsx` exports `metadata.title === "Agentic SLDC"` (SPEC R1).
  - No other fields or files change (SPEC R2).
- Verification:
  - `pnpm exec playwright test e2e/title.spec.ts` passes (GREEN).
- Dependencies: T1
- Files likely touched: `app/layout.tsx`
- Estimated scope: XS

### Checkpoint: Title change with RED/GREEN e2e coverage

- [ ] Required focused verification passes (`pnpm exec playwright test
      e2e/title.spec.ts` is GREEN)
- [ ] Human review is complete before continuing when the SPEC requires it

### Phase 2: Full validation

#### T3: Run full lint, type-check, build, and e2e suite

- [ ] Implement T3
- Description: Run the complete set of repository validation commands to
  confirm the title change does not regress linting, type-checking, the
  production build, or the existing Playwright suite (including
  `e2e/counter.spec.ts`).
- Acceptance criteria:
  - Lint, type-check, and build complete with no errors.
  - The full Playwright suite (`e2e/counter.spec.ts` and `e2e/title.spec.ts`)
    passes.
- Verification:
  - `pnpm lint`
  - `pnpm exec tsc --noEmit`
  - `pnpm build`
  - `pnpm exec playwright test`
- Dependencies: T2
- Files likely touched: none (verification only)
- Estimated scope: XS

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Playwright browser binaries unavailable in the implementation sandbox | Medium | Reuse the already-installed Playwright setup from the prior counter feature; if binaries are missing, run `pnpm exec playwright install --with-deps chromium` before T1 |
| Title change accidentally affects other metadata fields | Low | Limit the diff to the single `title` string literal in `app/layout.tsx`, verified by code review and the full test suite in T3 |
