# Header slots

Stable header chrome layout for draggable item shells (popup, modal, drawer, float, sidebar, bottom). Documented slot / prop names are **Stable** — renaming them is a **major**.

Related: [Stable API](./stable-api.md) · [Docs hub](./index.md)

## Layout

```
[ pre-title ] [ title | after-title ] …… spacer …… [ extra-btn ]
```

- **pre-title** — left of the title group (e.g. back / drag handle host).
- **title** — title text or custom title node.
- **after-title** — immediately to the **right** of the title (same title group), before the spacer.
- **extra-btn** — trailing actions after the spacer (close / expand / custom buttons).

`DragHeader` (internal) implements this layout; public item components forward the same names.

## Vue ↔ React names

| Vue slot        | React prop / node | Role                                      |
| --------------- | ----------------- | ----------------------------------------- |
| `pre-title`     | `preTitle`        | Before the title group                    |
| `title`         | `title`           | Title text **or** custom title node       |
| `after-title`   | `afterTitle`      | Immediately after title, before spacer    |
| `extra-btn`     | `extraBtn`        | Trailing header actions after the spacer  |
| `default`       | `children`        | Panel body (not part of the header row)   |

## Rules

1. **`location: 'title'`** (map-dataset menus and similar hosts) maps to the **`after-title` / `afterTitle`** slot — **not** `extra-btn`.
2. React: prefer a **`title` node** for custom title content. **`titleNode` is deprecated** — use `title` instead.
3. Do not place trailing chrome (close, expand, switcher) in `after-title`; those belong in `extra-btn` / built-in header actions.
4. Not every shell exposes every slot (e.g. some omit `pre-title`). Names that *are* documented on a component remain Stable for that surface.

## Component docs

| Component | Doc |
| --------- | --- |
| Popup | [draggable-item-popup.md](./draggable-item-popup.md) |
| Modal | [draggable-modal.md](./draggable-modal.md) |
| Drawer | [draggable-drawer.md](./draggable-drawer.md) |
| Float | [draggable-item-float.md](./draggable-item-float.md) |
| Sidebar | [draggable-item-sidebar.md](./draggable-item-sidebar.md) |
| Bottom | [draggable-item-bottom.md](./draggable-item-bottom.md) |
