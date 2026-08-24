---
name: test-driven-development
description: Proves new behavior with tests before and after implementation.
---

# Test-Driven Development

Use a RED → GREEN → REFACTOR cycle for every behavior-changing implementation
task. Tests are proof of an observable outcome, not of internal call order.

## Cycle

1. Discover the repository's real test command, framework, and test-location
   conventions before writing a test.
2. Write a focused test that describes the task's expected behavior and fails
   before the implementation exists (RED).
3. Implement the minimum change required to make that test pass (GREEN).
4. Refactor only while preserving green tests.
5. Run the focused test and the full existing test suite before declaring the
   task complete, then run its required build/type verification.

## Test Design

- Test outcomes, inputs, and observable state rather than implementation
  details.
- Prefer real implementations over mocks; use mocks only at slow,
  nondeterministic, or external boundaries.
- Keep tests deterministic and isolated, with descriptive names.
- For a bug, first add a reproduction test that fails without the fix.

## Exceptions and Verification

Pure configuration or documentation changes with no behavior to exercise do
not require an artificial unit test. Instead, run the configuration's native
validator/compiler and inspect its generated artifact. Never claim a test
suite passed when the repository has no test command; state that limitation and
run every available relevant verification command.
