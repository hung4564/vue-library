---
name: git-commit
description: >-
  Guidelines and procedures for generating and validating git commit messages
  in accordance with this repository's commitlint and Husky rules. Enforces
  user review before committing — never commit automatically.
---

# Git Commit Message Guidelines & Review Procedure

This repository uses `@commitlint/config-conventional` enforced via Husky's `commit-msg` hook.

## ⚠️ Critical Rule: No Automatic Commits

**Never execute `git commit` autonomously.** Always draft the message, list the affected files, and present the proposal for user review and approval before committing.

---

## Strict Rules

1. **Header Line**:
   - Format: `<type>(<scope>): <subject>` or `<type>: <subject>`
   - Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
   - Length: $\le 72$ characters.
   - Lowercase type and subject, imperative mood ("add", not "added"), no period at end.

2. **Body Line Length (CRITICAL: `body-max-line-length`)**:
   - Commitlint enforces `body-max-line-length`: **Maximum 100 characters per line**.
   - Any line exceeding 100 characters will fail commit validation.
   - Always **hard-wrap body lines at 80–90 characters**.

3. **Footer**:
   - Blank line before footer.
   - `BREAKING CHANGE: <description>` or `Closes #123`.

---

## Review & Execution Flow

1. Complete code changes and validations (`test`, `lint`, `typecheck`).
2. Run `git status -s` to inspect changes.
3. Draft the Conventional Commit message.
4. Present the files and commit message to the user for review.
5. Execute `git commit` **ONLY** after explicit user approval.

---

## Example of Correct Multi-line Formatting

```text
feat: enhance layer and dataset management with delete policies

- Added functionality to remove selected layers and all layers
  in LayerList component.
- Introduced delete policies for datasets, allowing for more
  granular control over deletion behavior.
- Updated LayerSubItem and LayerItem components to support removal.
- Enhanced UI with delete buttons for selected layers and improved
  feedback for layer management.
- Added tests for delete policies to ensure correct behavior.
- Refactored dataset API to streamline dataset management.
```
