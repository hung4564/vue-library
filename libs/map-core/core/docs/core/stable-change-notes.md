# Stable change notes (consumers)

Short notes for app authors following `@hungpvq` map **Stable** surfaces. Package `CHANGELOG.md` files are produced by release tooling — do not treat this page as a substitute for SemVer release notes.

## How to use this page

- After upgrading a map group version, skim here for **additive** Stable behaviors that may not be obvious from the changelog alone.
- Breaking removals still require a **major** and the SemVer checklist in [`libs/map-core/README.md`](https://github.com/hung4564/vue-library/blob/main/libs/map-core/README.md#checklist-semver--breaking-change).
- Canonical allowlists: [Stable API](./stable-api.md).

## Recent local hardening (docs / DX)

| Area | Note |
|------|------|
| Attribute table | Optional column **contains** text filter; **number** / **date** filter ops; **column visibility** toggles (`@hungpvq/map-dataset/attribute-table` helpers + Vue/React toolbar). Additive on the attribute-table subpath. |
| LayerControl | Tree keyboard / ARIA (`role="tree"` / `treeitem`); `/` still focuses layer search. |
| Identify result | Polite `aria-live` on the result region (Vue/React Identify result chrome). |
| Draw toolbar | `role="toolbar"`; Esc cancels while drawing when focus is in draw chrome (Vue/React DrawControl). |
| InputSelect (Vue) | `TItem` / `TValue` generics so `{ value, text }[]` items work with string-union `v-model`. |
| Story telling | React demo `#/story-telling` / `#/story-telling-gps` shares the chapter action engine with Vue (parity). |
| Demos | Focused routes `#/print`, `#/crs`, `#/devtools`, `#/theme` (plus `#/basemap-error`, `#/multi-map`). Kitchen-sink guide lists key controls. |
| Dist smoke | `npm run map:smoke:dist` checks map package dist outputs / declared exports (core, dataset, draw, vue/react adapters). |

## Related

- [Minimal starter](./minimal-starter.md)
- [Install from npm](./install-from-npm.md)
- [Error handling](./error-handling.md)
- [Peers and bundle](./peers-and-bundle.md)
