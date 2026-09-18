# Stable change notes (consumers)

Short notes for app authors following `@hungpvq` map **Stable** surfaces. Package `CHANGELOG.md` files are produced by release tooling — do not treat this page as a substitute for SemVer release notes.

## How to use this page

- After upgrading a map group version, skim here for **additive** Stable behaviors that may not be obvious from the changelog alone.
- Breaking removals still require a **major** and the SemVer checklist in [`libs/map-core/README.md`](https://github.com/hung4564/vue-library/blob/main/libs/map-core/README.md#checklist-semver--breaking-change).
- Canonical allowlists: [Stable API](./stable-api.md).

## Recent local hardening (docs / DX)

| Area | Note |
|------|------|
| Attribute table | Optional column **contains** text filter (`@hungpvq/map-dataset/attribute-table` helpers + Vue/React toolbar). Additive on the attribute-table subpath. |
| LayerControl | Tree keyboard / ARIA (`role="tree"` / `treeitem`); `/` still focuses layer search. |
| Identify result | Polite `aria-live` on the result region. |
| Draw toolbar | `role="toolbar"`; Esc cancels while drawing when focus is in draw chrome. |
| InputSelect (Vue) | `TItem` / `TValue` generics so `{ value, text }[]` items work with string-union `v-model`. |
| Demos | `#/basemap-error`, `#/multi-map`; kitchen-sink guide lists key controls. Local dist smoke: `npm run map:smoke:dist`. |

## Related

- [Minimal starter](./minimal-starter.md)
- [Install from npm](./install-from-npm.md)
- [Error handling](./error-handling.md)
- [Peers and bundle](./peers-and-bundle.md)
