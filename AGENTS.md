# Workspace Guidelines for AI Agents

## Git Commit Rules (Strict Conventional Commits & Review-First)

### 0. CRITICAL: No Automatic Commits (Review-First Policy)

- **NEVER execute `git commit` automatically or autonomously.**
- Always finish verification (`lint`, `test`, `typecheck`), prepare the commit message and list of changed files, and **present them to the user for review first**.
- **ONLY run `git commit` after the user has explicitly confirmed/approved the proposal.**

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
