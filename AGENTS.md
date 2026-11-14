# Workspace Guidelines for AI Agents

## Git Commit Rules (Strict Conventional Commits)

This repository enforces Conventional Commits via Husky and `@commitlint/config-conventional`.
Any commit message generated or executed MUST strictly satisfy the following rules:

### 1. Header Rules
- Format: `<type>(<scope>): <short summary>` or `<type>: <short summary>`
- Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Type must be **lowercase**.
- Subject must be **lowercase**, imperative mood ("add", not "added" or "adds").
- **No trailing period (`.`)** at the end of the subject.
- **Max header length**: $\le 72$ characters.

### 2. Body Rules (CRITICAL: `body-max-line-length`)
- There MUST be a **blank line** between the header and the body.
- **Strict limit**: Every single line in the commit message body **MUST NOT exceed 100 characters** (`body-max-line-length`).
- To be safe against line-length limits, **hard-wrap all lines at 80–90 characters**.
- If a bullet point is long, wrap it across multiple indented lines:
  ```text
  - Introduced delete policies for datasets, allowing more granular
    control over deletion behavior.
  - Enhanced UI with delete buttons for selected layers and improved
    feedback for layer management.
  ```

### 3. Footer Rules
- If mentioning breaking changes, use `BREAKING CHANGE: <description>`.
- If referencing issues, use `Closes #123`.
- Must have a blank line before the footer.

---

## Monorepo Standards
- **Component Styling**: Do not use inline styles inside template/JSX. Always use CSS classes (prefer existing shared utility classes).
- **Verification**: Run tests with `npx nx test <project> --skip-nx-cache` and typechecks with `npx nx run-many -t typecheck -p <project> --skip-nx-cache`.
