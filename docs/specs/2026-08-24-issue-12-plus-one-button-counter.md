---
issue: 12
status: planned
author: juan-turk-monks
---

# Spec: Interactive +1 button counter on the homepage

- Issue: #12
- Status: draft
- Date: 2026-08-24

## Objective

Add a single interactive button to the homepage (`app/page.tsx`), centered
both vertically and horizontally in the viewport. Each click increments a
counter starting at 0, and the button's own text always displays the current
count (e.g. `0`, `1`, `2`, ...). This replaces the current default
`create-next-app` homepage content, which is unrelated boilerplate. Success
means a visitor sees exactly one button in the center of the page and clicking
it increases the displayed number by 1 every time, with no page reload.

## Tech Stack

- Next.js 16.3.1 (App Router), React 19.2.8 / react-dom 19.2.8
- TypeScript 5, strict mode (`tsconfig.json`)
- Tailwind CSS 4 (via `@tailwindcss/postcss`), global styles in
  `app/globals.css`
- ESLint 9 with `eslint-config-next` (`core-web-vitals` + `typescript`)
- Package manager: pnpm 10.33.0 (single-package workspace, see
  `pnpm-workspace.yaml`)
- No test runner is currently installed. `@playwright/test` is referenced only
  as an optional peer dependency of `next` in `pnpm-lock.yaml`, not as an
  installed devDependency, and no Playwright config exists in the repo.

## Commands

- Install dependencies: `pnpm install`
- Dev server: `pnpm dev`
- Build: `pnpm build`
- Start (production): `pnpm start`
- Lint: `pnpm lint`
- Type check: `pnpm exec tsc --noEmit`
- End-to-end tests (to be introduced by this change):
  `pnpm exec playwright test`

## Project Structure

- `app/page.tsx` — homepage route component (Server Component by default);
  this is where the counter button is added. Client-side interactivity
  (`onClick`, `useState`) requires a `"use client"` boundary.
- `app/layout.tsx` — root layout; body is `min-h-full flex flex-col`, wrapping
  every page including the homepage.
- `app/globals.css` — Tailwind entry point and global styles.
- `public/` — static assets (unused by this change).
- No existing `tests/` or `e2e/` directory; this change introduces
  `e2e/` at the repository root for Playwright specs and a root
  `playwright.config.ts`.

## Code Style

Existing components are typed functional components using Tailwind utility
classes directly in JSX, for example in `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      ...
    </div>
  );
}
```

Conventions to follow: default-exported PascalCase component functions,
Tailwind utility classes (including `dark:` variants) for styling instead of
custom CSS, no external UI library, and TypeScript with no `any`.

## Testing Strategy

- No automated test runner exists in this repository today. Per the
  repository's own planning guardrails (`.github/workflows/plan.md`,
  `.github/workflows/build.md`), a behavior change must ship with an automated
  test, and adding the minimal test infrastructure is permitted when no
  runner exists and the addition is not a disputed architectural decision.
  Playwright is the least invasive choice: `@playwright/test` is already
  Next.js's own optional peer dependency, requires no framework/router
  changes, and drives the app exactly as a user would (click, read text).
- Test level: end-to-end (browser-driven), matching the plan's preference for
  integration/e2e coverage over an artificial unit test for a UI interaction
  behavior.
- Location: `e2e/counter.spec.ts`, configuration in `playwright.config.ts`
  (webServer launches `pnpm dev` against the built app, or `pnpm build && pnpm
  start` for CI-stability — implementer chooses per task verification step).
- RED: before implementing the button, run
  `pnpm exec playwright test e2e/counter.spec.ts` — it MUST fail because no
  counter button exists yet (selector not found / initial assertion fails).
- GREEN: after implementing the button, the same command MUST pass, verifying:
  - Exactly one button element renders on the homepage.
  - Its initial text is `0`.
  - After one click, its text is `1`; after a second click, `2`.
  - Its computed background color is `#1f883d` (`rgb(31, 136, 61)`) and its
    computed text color is white (`rgb(255, 255, 255)`) (SPEC R6).
- Full suite command: `pnpm exec playwright test` (only one spec file exists
  after this change, so it is equivalent to the focused command).
- Manual/complementary checks (do not replace the e2e test): `pnpm lint`,
  `pnpm exec tsc --noEmit`, `pnpm build`.

## Boundaries

- Always: keep the button as the sole interactive/visible content of the
  homepage; use Tailwind classes consistent with existing styling; preserve
  TypeScript strictness; keep the new Playwright config and test scoped to
  this feature (do not add unrelated test scaffolding).
- Ask first: any decision to introduce a state-management library, a
  component library, or persist the count outside the current page session
  (e.g. localStorage, server state) — none of this is required by the issue
  and must not be assumed.
- Never: keep any of the current `create-next-app` boilerplate content
  (logo, "Deploy Now" / "Documentation" links, learn text) on the homepage
  once the button replaces it, per the issue's "only one button" requirement;
  never add a second interactive element to the homepage.

## Technical Design

- R1: `app/page.tsx` MUST render a client component (or import one) so the
  click handler and `useState` counter work; since the current `Home` export
  has no other server-only requirement (no data fetching), the simplest
  compliant approach is adding `"use client"` at the top of `app/page.tsx` and
  using `useState<number>(0)`.
- R2: The homepage root container MUST center its single child both
  horizontally and vertically, e.g. `flex flex-1 items-center justify-center`
  filling the available height provided by `RootLayout`'s
  `min-h-full flex flex-col` body.
- R3: The button MUST display only the numeric count as its text content
  (e.g. `0`), updating synchronously on each click via
  `setCount((c) => c + 1)`.
- R4: All existing boilerplate markup (Next.js/Vercel logo images, links, and
  copy) MUST be removed from `app/page.tsx`; the `public/next.svg` and
  `public/vercel.svg` assets may remain in `public/` unused, since removing
  static assets is out of scope.
- R5: The homepage MUST contain exactly one `<button>` element and no other
  interactive controls.
- R6: The button MUST have a background color of `#1f883d` and white text
  (e.g. Tailwind arbitrary-value utilities `bg-[#1f883d] text-white`), per
  product decision in the PR review of this plan (overrides the "Tailwind
  utility classes consistent with existing styling" default color choice from
  the Code Style section for this specific button).

## Success Criteria

- Visiting the homepage shows a single centered button reading `0` (R2, R3,
  R5).
- Clicking the button increments the displayed number by exactly 1 per click,
  with the text always matching the running total (R1, R3).
- No other interactive or boilerplate content remains on the homepage (R4,
  R5).
- The button's background is `#1f883d` with white text (R6).
- `pnpm exec playwright test e2e/counter.spec.ts` passes; `pnpm lint`,
  `pnpm exec tsc --noEmit`, and `pnpm build` all succeed.
