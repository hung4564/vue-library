---
category: Component
---

# ContextMenu / ContextMenuItem

**Experimental.** Prefer these helpers for switcher menus and app chrome; not a full WAI-ARIA menu (no submenu / typeahead).

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
| Keyboard | Esc closes; Arrow Up/Down, Home/End; Enter/Space activates focused item |
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
