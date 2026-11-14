---
name: git-commit
description: >-
  Guidelines and procedures for generating and validating git commit messages
  in accordance with this repository's commitlint and Husky rules. Use whenever
  preparing or executing git commits.
---

# Git Commit Message Guidelines

This repository uses `@commitlint/config-conventional` enforced via Husky's `commit-msg` hook.

## Strict Rules

1. **Header Line**:
   - Format: `<type>(<scope>): <subject>`
   - Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
   - Length: $\le 72$ characters.
   - Lowercase type and subject, no period at end.

2. **Body Line Length (CRITICAL)**:
   - Commitlint enforces `body-max-line-length`: **Maximum 100 characters per line**.
   - Any line exceeding 100 characters will fail commit validation.
   - Always wrap body lines at 80-90 characters.

3. **Example of Correct Multi-line Formatting**:
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
