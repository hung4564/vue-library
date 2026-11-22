---
name: commit-review
description: >-
  Mandatory workflow for git commits. Strictly forbids automatic commits;
  requires drafting a compliant Conventional Commit message and presenting it
  along with changed files for user review and confirmation before committing.
---

# Commit Review & Staging Workflow

## ⚠️ Core Directive: No Automatic Commits

**AI agents MUST NOT execute `git commit` automatically or autonomously.**

Even if tests pass and all edits are complete, you must never run `git commit` without prior review. Always prepare the commit proposal and ask the user for confirmation first.

---

## 📋 Required Two-Step Workflow

### Step 1: Prepare Commit Proposal (Without Committing)

1. **Verify Changed Files**:
   Run `git status -s` to inspect modified, added, or deleted files. Ensure no untracked junk or debug files are staged.
2. **Draft Conventional Commit Message**:
   Generate a commit message strictly following repository rules:
   - **Header**: `<type>(<scope>): <short summary>` ($\le 72$ characters, lowercase, no trailing period).
     - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
   - **Body (Strict Line Length)**:
     - Must have a blank line between header and body.
     - **Hard-wrap all body lines at 80–90 characters** (Hard limit: 100 chars max).
     - Long bullet points must wrap across indented lines.
   - **Footer**: `BREAKING CHANGE: ...` or `Closes #...` if applicable.
3. **Present Proposal to User**:
   Present the proposed commit to the user with:
   - List of files to be committed.
   - The exact proposed commit message (in a code block).
   - An explicit request for user review/approval before executing `git commit`.

### Step 2: Commit Only Upon Explicit User Approval

- Only after the user confirms (e.g., replies with "Commit", "Proceed", "LGTM", or gives approval), execute `git add` and `git commit`.
- If the user requests edits to the message or files, revise the proposal and confirm again.

---

## 💡 Example Proposal Format

When presenting to the user:

````markdown
### 📝 Proposed Git Commit for Review

**Changed Files:**

- `libs/ui-core/vue/src/BaseButton.vue`
- `libs/ui-core/vue/src/button.spec.ts`

**Proposed Commit Message:**

```text
feat(ui-core): add disabled state handling to BaseButton

- Handle disabled styling and prevent click events when button is disabled.
- Add unit tests verifying click suppression on disabled button instances.
```
````

Would you like me to proceed with this commit, or would you like any adjustments?

```

```
