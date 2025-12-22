---
description: Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync.
handoffs: 
  - label: Build Specification
    agent: speckit.specify
    prompt: Implement the feature specification based on the updated constitution. I want to build...
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

You are updating the project constitution at `.specify/memory/constitution.md`. This file contains foundational principles that guide all technical decisions, feature development, and operational procedures.

Follow this execution flow:

1. Load the existing constitution at `.specify/memory/constitution.md`.
   - Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]`.
   - Respect the number of principles specified by the user.

2. Collect/derive values for placeholders:
   - If user input supplies a value, use it.
   - Otherwise infer from existing repo context (README, docs, PRD).
   - For governance dates: `RATIFICATION_DATE` is the original adoption date, `LAST_AMENDED_DATE` is today if changes are made.
   - `CONSTITUTION_VERSION` must increment according to semantic versioning:
     - MAJOR: Backward incompatible governance/principle removals or redefinitions.
     - MINOR: New principle/section added or materially expanded guidance.
     - PATCH: Clarifications, wording, typo fixes, non-semantic refinements.

3. Draft the updated constitution content:
   - Replace every placeholder with concrete text.
   - Preserve heading hierarchy.
   - Ensure each Principle section: name, rules (MUST/SHOULD), rationale.
   - Ensure Governance section lists amendment procedure, versioning policy, compliance review.

4. Consistency propagation checklist:
   - Verify `plan-template.md` aligns with constitutional principles.
   - Verify `spec-template.md` scope/requirements alignment.
   - Verify `tasks-template.md` task categorization reflects principles.
   - Verify command files have correct references.

5. Produce a Sync Impact Report (prepend as HTML comment):
   - Version change: old → new
   - List of modified principles
   - Added/removed sections
   - Templates status (✅ updated / ⚠ pending)
   - Follow-up TODOs

6. Validation before final output:
   - No unexplained bracket tokens
   - Version matches report
   - Dates in ISO format (YYYY-MM-DD)
   - Principles are declarative and testable

7. Write the completed constitution back to `.specify/memory/constitution.md`.

8. Output final summary to user with version, bump rationale, and suggested commit message.

## Formatting & Style Requirements

- Use Markdown headings as specified
- Wrap long lines to ~100 characters
- Single blank line between sections
- No trailing whitespace

## Commands

- `speckit.constitution` - Update constitution interactively or with provided principles
- `speckit.constitution [principle descriptions]` - Update with specific principles

---
*InterfaceHive Constitution Command Reference*

