# Commit Message Instructions for GitHub Copilot in VS Code

You are generating commit messages for this repository. Every commit message MUST strictly satisfy `@commitlint/config-conventional` and Husky validation.

## Structure

```text
<type>(<scope>): <short summary>

- <bullet point 1>
- <bullet point 2>
```

## Strict Requirements

1. **Header Line**:
   - Format: `<type>(<scope>): <short summary>` or `<type>: <short summary>`.
   - Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
   - Type and subject must be **all lowercase**.
   - Use imperative mood: "add", "fix", "refactor" (NOT "added", "fixes", "refactored").
   - **No trailing period (`.`)** at the end of the subject.
   - **Maximum header length**: 72 characters.

2. **Blank Line Separation**:
   - Must have a blank line between header and body.
   - Must have a blank line between body and footer (if any).

3. **CRITICAL: Body Line Length (`body-max-line-length`)**:
   - Commitlint strictly rejects any line in the body longer than **100 characters**.
   - **Hard-wrap all body lines at 80–90 characters**.
   - For long bullet points, wrap and indent subsequent lines:
     ```text
     - Introduced delete policies for datasets, allowing for more
       granular control over deletion behavior.
     - Enhanced UI with delete buttons for selected layers and improved
       feedback for layer management.
     ```

## Example Commit Message

```text
feat(basemap): inline base64 thumbnails for built-in basemaps

- Inlined base64 data URIs for all default basemap thumbnails.
- Resolved 404 missing image issue when used as published library.
- Updated unit tests to validate data URI format.
```
