---
name: Plan
description: Reads a tagged issue, clarifies ambiguities, and opens a PR with a SPEC and task checklist

on:
  issues:
    types: [labeled]
    names: ["agent:plan"]
  workflow_dispatch:
    inputs:
      issue_id:
        description: "Issue number to plan"
        required: true
        type: string

permissions:
  contents: read
  issues: read
  copilot-requests: write

jobs:
  mark-planning:
    runs-on: ubuntu-slim
    permissions:
      issues: write
    steps:
      - name: Mark issue as planning
        uses: actions/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3 # v9.0.0
        with:
          script: |
            const issueNumber = Number(
              context.payload.issue?.number ?? context.payload.inputs?.issue_id,
            );

            if (!Number.isInteger(issueNumber) || issueNumber <= 0) {
              throw new Error(
                "A positive issue number is required to start planning.",
              );
            }

            await github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: issueNumber,
              labels: ["agent:planning"],
            });

            const { data: labels } = await github.rest.issues.listLabelsOnIssue({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: issueNumber,
            });

            if (labels.some((label) => label.name === "agent:plan")) {
              await github.rest.issues.removeLabel({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issueNumber,
                name: "agent:plan",
              });
            }

skills:
  - .github/skills/spec-driven-development
  - .github/skills/planning-and-task-breakdown

tools:
  github:
    toolsets: [issues]

safe-outputs:
  add-comment:
    max: 1
  add-labels:
    allowed: ["agent:plan-finished"]
  remove-labels:
    allowed: ["agent:planning"]
  create-pull-request:
    branch-prefix: "spec/"
    draft: false
    title-prefix: "[spec] "
    labels: ["agent:planning", "spec"]
    auto-close-issue: false
    allowed-files:
      - docs/**
---

# Plan — Issue to SPEC and Tasks

Your job is to read an issue, understand the requirement in the context of this repository, and produce a formal SPEC and implementation task checklist.

Use the installed `spec-driven-development` skill to specify the work, then
use `planning-and-task-breakdown` to derive ordered, verifiable tasks. The
repository output conventions below override the generic output paths in those
skills.

## Target issue

{{#if github.event.issue.number}}
This run was triggered by applying the `agent:plan` label to an issue.

Issue number: ${{ github.event.issue.number }}
{{/if}}
{{#if inputs.issue_id}}
This run was triggered manually (workflow_dispatch).

Issue number: ${{ inputs.issue_id }}
Fetch the issue using the GitHub tools (or `gh issue view`) before continuing.
{{/if}}

## Step 1 — Start work

The deterministic `mark-planning` job has already added `agent:planning` and
removed `agent:plan` before you started. Do not request either label change.

## Step 2 — Understand the issue

1. Read the full issue: title, body, and all comments.
2. Explore the repository to understand existing conventions, architecture, constraints and related code that this feature touches.
3. Understand core features and acceptance criteria.
4. Identify ambiguities or missing information. If critical details are
   missing, add one comment to the source issue that:
   - Mentions the issue author as `@<ISSUE_AUTHOR>`.
   - Lists only the concrete questions needed to clarify the intended behavior.
   - Explains that planning is paused until the author answers.
   Do not create files, commits, or a pull request in this case. Do not guess
   the missing requirements. A human must reapply the `agent:plan` label after
   answering to start a new planning run.

## Step 3 — Write the SPEC and Task

When the issue is unambiguous, create these two files, using the same date,
issue number, and short title in both names:

- `docs/specs/<DATE>-issue-<ISSUE_NUMBER>-<SHORT_TITLE>.md`
- `docs/tasks/<DATE>-issue-<ISSUE_NUMBER>-<SHORT_TITLE>.md`

The SPEC must use this structure:

```markdown
# Spec: <short title>

- Issue: #<ISSUE_NUMBER>
- Status: draft
- Date: <date>

## Objective

What will be built, why, who benefits, and what success looks like.

## Tech Stack

Relevant framework, language, and dependencies as discovered in the repository.

## Commands

The full repository commands for build, focused tests, lint, and local development.

## Project Structure

Relevant source, test, and documentation locations.

## Code Style

One real, concise example from the repository and the conventions it demonstrates.

## Testing Strategy

Test levels, locations, and focused commands appropriate for the change.

## Boundaries

- Always: repository-specific rules that apply to this work.
- Ask first: decisions that need human approval.
- Never: actions outside the permitted scope.

## Technical Design

How it fits into the current codebase: modules, data flow, and contracts. Use
RFC 2119 keywords and numbered requirements (R1, R2, ...) when they clarify a
testable behavior.

## Success Criteria

Specific, testable conditions, mapped to the requirements where applicable.

## Open Questions

Leave this section out when there are no unresolved questions. Questions that
block planning belong in the source issue, not in a draft SPEC.
```

If the issue contains several independently testable capabilities, first add a
`## Capability Map` to the SPEC. It MUST list stable module ids, each module's
responsibility and dependencies, followed by the build order. Do not decompose
a single capability merely to create hierarchy.

The task file is a tentative, sequential implementation checklist. Group the
work in implementation phases. Every actionable step MUST start unchecked and
be specific enough to be marked complete in a later implementation commit. For
example:

```markdown
# Implementation Plan: <short title>

- Issue: #<ISSUE_NUMBER>
- Status: planned
- Date: <date>

## Overview

One paragraph summarizing the intended implementation.

## Architecture Decisions

- <decision and rationale>

## Task List

### Phase 1: <phase name>

#### T1: <first implementation step>

- [ ] Implement T1
- Description: <one paragraph explaining the outcome>
- Acceptance criteria:
  - <specific, testable condition>
- Verification:
  - <focused repository command or manual check>
- Dependencies: None
- Files likely touched: `<path>`
- Estimated scope: XS, S, or M

#### T2: <second implementation step>

- [ ] Implement T2
- Description: <one paragraph explaining the outcome>
- Acceptance criteria:
  - <specific, testable condition>
- Verification:
  - <focused repository command or manual check>
- Dependencies: T1
- Files likely touched: `<path>`
- Estimated scope: XS, S, or M

### Checkpoint: <phase name>

- [ ] Required focused verification passes
- [ ] Human review is complete before continuing when the SPEC requires it

### Phase 2: <phase name>

#### T3: <next implementation step>

- [ ] Implement T3
- Description: <one paragraph explaining the outcome>
- Acceptance criteria:
  - <specific, testable condition>
- Verification:
  - <focused repository command or manual check>
- Dependencies: T2
- Files likely touched: `<path>`
- Estimated scope: XS, S, or M

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| <risk> | High, Medium, or Low | <mitigation> |
```

The implementation agent uses this file as the persistent source of truth:
it completes phases and tasks in order, marks each completed `Implement T<N>`
item with `[x]` in the same atomic commit, and resumes from the first unchecked
task after a failure. Tasks must follow the dependency graph, be vertical
slices where possible, include acceptance criteria and verification, and stay
XS, S, or M; break down L or XL work before creating the plan.

Adapt both files to what you find in the repository; do not invent structure
that contradicts existing documentation.

## Step 4 — Create the pull request

1. Commit only the new SPEC and task files.
2. Create a pull request titled `[spec] <short title>` whose body:
   - Links the source issue (`Refs #<ISSUE_NUMBER>`).
   - Contains a summary of the SPEC and the implementation phases.
3. Only after requesting that pull request, remove `agent:planning` from the
   source issue and add `agent:plan-finished`. For both safe-output requests,
   target the source issue explicitly with `item_number: <ISSUE_NUMBER>`.

Do not modify any other files. Do not implement the feature itself.
