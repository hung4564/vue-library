# GitHub Copilot Instructions for Vue-Library Monorepo

## Git Commit Rules (Conventional Commits)
When generating commit messages, strictly follow the rules in [.github/copilot-commit-instructions.md](file:///g:/code/0-library/vue-library/.github/copilot-commit-instructions.md):
- **Header**: `<type>(<scope>): <summary>` (lowercase, imperative mood, $\le 72$ chars, no trailing period).
- **CRITICAL**: Every single line in the body must be **hard-wrapped at 80–90 characters** (commitlint strictly rejects lines $> 100$ characters via `body-max-line-length`).
- Always leave a blank line between header and body.

## Code Standards
- **Component Styling**: Do not use inline styles inside templates or JSX. Always use CSS classes (prefer existing shared utility classes).
- **Type Checking & Testing**: Ensure changes pass `npx nx test <project> --skip-nx-cache` and `npx nx run-many -t typecheck -p <project> --skip-nx-cache`.
