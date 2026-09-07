---
category: Component
---

# ContextMenu / ContextMenuItem

**Experimental.** Prefer these helpers for switcher menus and app chrome. Keyboard/a11y: Esc, arrows, Home/End, Enter/Space, **typeahead**, focus restore on close. Not a full WAI-ARIA menu yet (no submenu). See [a11y.md](./a11y.md).

## Usage pattern

1. Keep a ref to `ContextMenu`.
2. Call `ref.open(mouseEvent)` from a button click or `contextmenu`.
3. Put items in `<ul class="context-menu">` using `ContextMenuItem` (`role="menuitem"`).

### Cases

| Case | How |
|------|-----|
| Right-click | `@contextmenu` / `onContextMenu` → `open(e)` (+ `preventDefault`) |
| Button open | same `open(e)` with the click event (positions near pointer) |
| Active row | `active` on `ContextMenuItem` |
| Disabled row | `disabled` — skipped by Arrow navigation |
| Keyboard | Esc closes (+ restores focus); Arrow Up/Down/Left/Right, Home/End; Enter/Space activates; typeahead by label |
| Close after select | call `ref.close()` in the item click handler |

## Demo

Vue / React demo-draggable: **Menu** nav (`#/menu`) — canvas right-click, button open, active/disabled items, last-action log.

## Vue sketch

```vue
<ContextMenu ref="menuRef">
  <ul class="context-menu">
    <ContextMenuItem :active="id === 'a'" @click="onPick('a')">A</ContextMenuItem>
    <ContextMenuItem disabled>Off</ContextMenuItem>
  </ul>
</ContextMenu>
```

## React sketch

```tsx
<ContextMenu ref={menuRef}>
  <ul className="context-menu">
    <ContextMenuItem active={id === 'a'} onClick={() => onPick('a')}>
      A
    </ContextMenuItem>
    <ContextMenuItem disabled>Off</ContextMenuItem>
  </ul>
</ContextMenu>
```
