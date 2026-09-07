# Stable API (v1)

Allowlist of symbols and protocols we treat as **Stable** for SemVer on `1.x`.

Everything else reached via root `export *` is **experimental**: may change in a **minor** if the team follows this page. Until then, treat undocumented barrel exports as public-at-risk.

Related: [SemVer checklist](../../README.md#checklist-semver--breaking-change) · [Docs hub](./index.md)

## Architecture

- **Core:** `@hungpvq/draggable` — types, store (`drag:core`), utils, shared CSS.
- **Adapters:** `@hungpvq/vue-draggable` / `@hungpvq/react-draggable` — components, hooks, framework store wiring (`configureDragStore`).
- Prefer store APIs from `@hungpvq/draggable` in framework-agnostic code; use wrapper packages for UI.

## `@hungpvq/draggable`

| Area | Stable surface |
|------|----------------|
| Types / factories | `ItemGroupKey`, `DraggableItemType`, `LocationSideBar`, `ContainerStore*`, `InitOption`, `createEmptyContainer`, `createEmptyDrawer`, `createEmptySideBar`, `createEmptyItemGroup`, `itemTypeToGroup` |
| Store | `configureDragStore`, `useDragStore`, `useDragContainer`, `useDragItem`, `useSidebarItem`, `useDrawerItem`, `useDragComponent`, `useDragIsMobile` |
| Store key | `drag:core` (defineStore id / notify path prefix) |
| Utils | `checkIsFirst`, `checkIsLast`, `assertDefined` |
| Package exports | `.`, `./style.css` |

## `@hungpvq/vue-draggable`

| Area | Stable surface |
|------|----------------|
| Shell | `DraggableContainer` |
| Items | `DraggableItemPopup`, `DraggableItemFloat`, `DraggableItemBottom`, `DraggableModal`, `DraggableItemSideBar`, `DraggableDrawer` |
| HOC | `WithMobileHandle` |
| Store | Re-exports of Stable core store APIs after Vue `configureDragStore` |
| Props / events | Documented `show` / `v-model:show`, `containerId`, `title`, `location` (`left` \| `right` \| `top` \| `bottom`), size/position props in component docs |
| Package exports | `.`, `./style.css` |

## `@hungpvq/react-draggable`

| Area | Stable surface |
|------|----------------|
| Shell / items | Same component names as Vue |
| HOC | `WithMobileHandle` |
| Hooks | Public hooks from the package entry (`useInit*`, `useShow` / expand / highlight helpers, `useSideBarContainer`, `useComponent`, `useContainerSize`, …) |
| React-only | `ContainerProvider` / `useContainerId`, `useStoreReactive`, `useContainerReactive` |
| Store | Re-exports of Stable core store APIs after React `configureDragStore` |
| Props / events | Documented `show` + `onUpdateShow` (and equivalents), `containerId`, `location`, size/position props |
| Package exports | `.`, `./style.css` |

## CSS

Shared styles via `@hungpvq/draggable/style.css` or framework `./style.css` (prefer the framework package so wrapper-specific CSS is included). Documented import paths are Stable; undocumented class names remain experimental until listed here.

## Explicitly experimental (examples)

- `ManagementControl` and related debug UI
- `ContextMenu` internals not covered in component docs
- Undocumented barrel leftovers (parts-only exports, internal sidebar transition helpers)
- CSS class names / layout tokens not listed above
