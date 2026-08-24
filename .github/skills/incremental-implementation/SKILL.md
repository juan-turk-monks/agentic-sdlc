---
name: incremental-implementation
description: Delivers changes incrementally in small, verified, reversible slices.
---

# Incremental Implementation

Build thin vertical slices. Implement one complete task, test it, verify it,
commit it, and only then move to the next task. Do not accumulate unrelated or
unverified changes.

## Increment Cycle

1. Read the next unchecked task, its dependencies, acceptance criteria, and
   verification instructions.
2. Load only the relevant SPEC sections and source files.
3. Implement the smallest complete change that satisfies that task.
4. Run its focused verification and the repository's existing test and build
   commands when they apply.
5. Confirm the task's acceptance criteria, update its checkbox in the same
   atomic commit, and commit with a descriptive message that identifies the
   task.
6. Resume from the first unchecked task. Never run independent tasks in
   parallel and never skip a dependency without explicit human approval.

## Scope Discipline

- Touch only files required by the active task.
- Do not add speculative abstractions, unrelated cleanups, or refactors.
- Keep every commit independently reviewable and revertible.
- Preserve a working repository between tasks.
- If a task is blocked, do not continue: report the concrete blocker and the
  resolution needed through the configured issue-comment protocol.

## Verification

Before marking a task complete, verify that its acceptance criteria hold, the
relevant tests pass, the build is clean when applicable, and no unrelated
changes are included in the task commit.
