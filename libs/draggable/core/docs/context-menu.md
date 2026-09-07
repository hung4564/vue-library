---
category: Component
---

# ContextMenu / ContextMenuItem

**Experimental** (see [stable-api.md](./stable-api.md)). Prefer these helpers for switcher menus and app chrome. Keyboard/a11y: Esc, Tab trap, arrows, Home/End, Enter/Space, **typeahead**, focus restore on close. Not a full WAI-ARIA menu yet (no submenu). See [a11y.md](./a11y.md).

Import from the package root (1.x) or treat as unstable:

```ts
import { ContextMenu, ContextMenuItem } from '@hungpvq/vue-draggable'; // or react-draggable
```

## Props

| Prop / event | Vue | React | Notes |
|--------------|-----|-------|-------|
| `zIndex` | yes | yes | default `10000` |
| `ariaLabel` | yes | yes | menu `aria-label` (default `"Context menu"`) |
| Open change | `@update:open` | `onOpenChange(open)` | for `aria-expanded` on triggers |
| Ref API | `open(event)` / `close()` | same via `ContextMenuRef` | |

`ContextMenuItem`: `active`, `disabled`; sets `aria-current` / `aria-disabled`.

## Usage pattern

1. Keep a ref to `ContextMenu`.
2. Call `ref.open(mouseEvent)` from a button click or `contextmenu`.
3. Put items in `<ul class="context-menu" role="presentation">` using `ContextMenuItem` (`role="menuitem"`).
4. Optionally bind open state to the trigger’s `aria-expanded`.

### Cases

| Case | How |
|------|-----|
| Right-click | `@contextmenu` / `onContextMenu` → `open(e)` (+ `preventDefault`) |
| Button open | same `open(e)` with the click event (positions near pointer) |
| Active row | `active` on `ContextMenuItem` |
| Disabled row | `disabled` — skipped by Arrow / typeahead navigation |
| Keyboard | Esc closes (+ restores focus); Tab trapped in menu; Arrow Up/Down/Left/Right, Home/End; Enter/Space activates; typeahead by label |
| Close after select | call `ref.close()` in the item click handler |

## Demo

Vue / React demo-draggable: **Menu** nav (`#/menu`) — canvas right-click, button open, active/disabled items, last-action log.

## Vue sketch

```vue
<ContextMenu ref="menuRef" aria-label="Actions" @update:open="menuOpen = $event">
  <ul class="context-menu" role="presentation">
    <ContextMenuItem :active="id === 'a'" @click="onPick('a')">A</ContextMenuItem>
    <ContextMenuItem disabled>Off</ContextMenuItem>
  </ul>
</ContextMenu>
```

## React sketch

```tsx
<ContextMenu
  ref={menuRef}
  ariaLabel="Actions"
  onOpenChange={setMenuOpen}
>
  <ul className="context-menu" role="presentation">
    <ContextMenuItem active={id === 'a'} onClick={() => onPick('a')}>
      A
    </ContextMenuItem>
    <ContextMenuItem disabled>Off</ContextMenuItem>
  </ul>
</ContextMenu>
```
