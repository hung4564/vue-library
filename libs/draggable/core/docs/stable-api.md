# Stable API (v1)

Allowlist of symbols and protocols we treat as **Stable** for SemVer on `1.x`.

Root barrels use **explicit named exports** (no `export *`). Runtime surface is locked by `public-api.spec.ts` in each package. Symbols listed under **Experimental** may change in a **minor**.

Related: [SemVer checklist](../../README.md#checklist-semver--breaking-change) · [Docs hub](./index.md) · [CSS tokens](./css-tokens.md) · [Accessibility](./a11y.md)

## Architecture

- **Core:** `@hungpvq/draggable` — types, store (`drag:core`), utils, shared CSS.
- **Adapters:** `@hungpvq/vue-draggable` / `@hungpvq/react-draggable` — components, hooks, framework store wiring (`configureDragStore`).
- Prefer store APIs from `@hungpvq/draggable` in framework-agnostic code; use wrapper packages for UI.
- Prefer importing **Stable** symbols from the package root. Experimental UI also lives on the root for 1.x compat and as `experimental.ts` (same package) for clarity in source.

## `@hungpvq/draggable`

| Area | Stable surface |
|------|----------------|
| Types / factories | `ItemGroupKey`, `DraggableItemType`, `LocationSideBar`, `ContainerStore*`, `BottomConfig`, `InitOption`, `Bounds`, `ItemLayoutState`, `PanelSnapshot`, `createEmptyContainer`, `createEmptyDrawer`, `createEmptySideBar`, `createEmptyItemGroup`, `createEmptyBottom`, `itemTypeToGroup` |
| Store | `configureDragStore`, `useDragStore`, `useDragContainer`, `useDragItem`, `useSidebarItem`, `useDrawerItem`, `useBottomItem`, `useDragComponent`, `useDragIsMobile`, `useDragCommands`, `useDragLayout` |
| Bottom | Exclusive `ContainerStore.bottom.show?: string` (one active panel); shared `BottomContainer` shell + header switcher menu |
| Store key | `drag:core` (defineStore id / notify path prefix) |
| Layout | `ContainerStore.layouts`, `useDragLayout` → `setItemLayout` / `getItemLayout` / `getLayout` / `applyLayout` |
| Utils / a11y | `checkIsFirst`, `checkIsLast`, `assertDefined`, `clampBounds`, `focusFirst`, `restoreFocus`, `trapTabKey`, `getFocusableElements`, `setModalSiblingsInert`, `getMenuItems`, `handleMenuKeydown`, `clearMenuTypeahead` |
| Package exports | `.`, `./style.css` |

## `@hungpvq/vue-draggable`

| Area | Stable surface |
|------|----------------|
| Shell | `DraggableContainer` (`containerId`, optional `mobileBreakpoint` default `600`, optional `variant` `'default' \| 'plain'`) |
| Items | `DraggableItemPopup`, `DraggableItemFloat`, `DraggableItemBottom`, `DraggableModal`, `DraggableItemSideBar`, `DraggableDrawer` |
| HOC | `WithMobileHandle` |
| Hooks | `useInit*`, `useShow` / `useExpand` / `useHighlight`, `useSideBarContainer`, `useBottomContainer`, `useComponent`, `useContainerSize`, `useContainerOrder`, `useManagement`, `useIcon`, `withShow*` / `withExpand*` / `withShare*` helpers |
| Store | Re-exports of Stable core store APIs after Vue `configureDragStore` (includes `useDragCommands`, `useDragLayout`) |
| Props / events | Documented `id` (stable item id), `show` / `v-model:show`, `containerId`, `title`, `location`, `highlightMs`, size/position props; popup/modal `update:bounds` (also written to `layouts`); controlled `left`/`top`/`width`/`height` sync after mount |
| Package exports | `.`, `./style.css` |

## `@hungpvq/react-draggable`

| Area | Stable surface |
|------|----------------|
| Shell / items | Same component names as Vue (including `variant` on `DraggableContainer`) |
| HOC | `WithMobileHandle` |
| Hooks | Same Stable hook set as Vue (plus React `useContainerSize` module) |
| React-only | `ContainerProvider` / `useContainerId`, `useStoreReactive`, `useContainerReactive` |
| Store | Re-exports of Stable core store APIs after React `configureDragStore` (includes `useDragCommands`, `useDragLayout`) |
| Types | Import from `@hungpvq/draggable` (adapters do **not** re-export core types/factories) |
| Props / events | Documented `id`, `show` + `onUpdateShow`, `containerId`, `location`, `mobileBreakpoint`, `highlightMs`, size/position props; popup/modal `onBoundsChange`; controlled bounds sync after mount |
| Package exports | `.`, `./style.css` |

## CSS

Shared styles via `@hungpvq/draggable/style.css` or framework `./style.css` (prefer the framework package so wrapper-specific CSS is included).

Stable tokens (see [css-tokens.md](./css-tokens.md)):

- `--draggable-card-bg`, `--draggable-card-highlight-bg`, `--draggable-card-text`
- `--draggable-font-family`, `--draggable-font-size-xs`, `--draggable-font-size-2xl`, `--draggable-font-weight-medium`, `--draggable-line-height`, `--draggable-padding-header`
- `--draggable-radius`, `--draggable-shadow`, `--draggable-mask-bg`, `--draggable-z-modal`, `--draggable-header-height`

Each color/font token falls back to the matching `--map-*` token, then a hardcoded default. `variant="plain"` adds class `draggable-variant-plain` for transparent/inherit chrome. Documented import paths are Stable; undocumented class names remain experimental.

## Cookbook: persist layout

```ts
import { useDragLayout, type PanelSnapshot } from '@hungpvq/draggable'; // or vue-/react-draggable store re-export

const KEY = 'my-app:draggable-layout';
const layout = useDragLayout(containerId);

// Save (e.g. on beforeunload or after drag)
localStorage.setItem(KEY, JSON.stringify(layout.getLayout()));

// Restore after items are mounted / registered
const snapshots = JSON.parse(localStorage.getItem(KEY) || '[]') as PanelSnapshot[];
layout.applyLayout(snapshots);
```

Popup/modal drag-stop writes `layouts[id].bounds`; drawer writes `size` / `location`. Prefer stable `id` props so snapshots survive remounts.

## Explicitly experimental

Still exported from the **root** barrel for 1.x compatibility; treat as unstable (may change in a **minor**). Source module: `experimental.ts` in each adapter.

| Package | Experimental symbols |
|---------|----------------------|
| Vue | `ManagementControl`, `ContextMenu`, `ContextMenuItem` |
| React | `ManagementControl`, `Item`, `ItemList`, `ShowStatus*`, `ContextMenu`, `ContextMenuItem` (+ related props/ref types) |

**ContextMenu** keyboard/a11y: Esc close, Arrow/Home/End, Enter/Space, typeahead, focus restore. Prefer `ContextMenuItem` inside `<ul class="context-menu">`. Not a full WAI-ARIA menu yet (no submenu). See [context-menu.md](./context-menu.md), [a11y.md](./a11y.md), demo-draggable **Menu** (`#/menu`).

Undocumented CSS class names / layout tokens not listed above remain experimental.

## Enforcing the allowlist

1. Edit `src/index.ts` with **named** exports only (no `export *`). Prefer `import { X } from '…'; export { X }` for heavy shell graphs (Vite ESM).
2. Put unstable UI in `experimental.ts` (adapters) and list it in the Experimental table; root may re-export for 1.x compat.
3. Update the matching `public-api.spec.ts` allowlist arrays (runtime symbols only).
4. Update this page (Stable vs Experimental tables) and `a11y.md` when focus/ARIA/menu helpers change.
5. CI / `nx test` fails if a new accidental export appears or a Stable symbol is dropped without updating the lock.

## React store wiring (adapters)

- Vue: `configureDragStore({ makeReactive: reactive })` in `libs/vue/draggable/src/store`.
- React: `configureDragStore({ notify })` in `libs/react/draggable/src/store/index.ts`.
- React `useStoreReactive` / `useContainerReactive` live in `store/useStoreReactive.ts` and must **not** be re-exported from `store/index.ts` (circular barrel breaks Vite named exports). Root entry imports `./store` for side-effect configure, then exports reactive hooks from `useStoreReactive.ts`.

## Vite Fast Refresh + path aliases

React demos that resolve packages to `libs/**/src` must exclude `libs/` from `@vitejs/plugin-react` Fast Refresh — see [SemVer README §7](../../README.md#7-reducing-everything-is-breaking) and skill `draggable-semver-api`.
