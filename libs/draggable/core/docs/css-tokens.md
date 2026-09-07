# CSS tokens

Theme the shared chrome without forking CSS. Prefer `--draggable-*`; map apps can keep setting `--map-*` (used as fallback).

| Token | Fallback | Default |
|-------|----------|---------|
| `--draggable-card-bg` | `--map-card-bg` | `rgba(32, 43, 54, 0.9)` |
| `--draggable-card-highlight-bg` | `--map-card-highlight-bg` | `rgba(26, 115, 232)` |
| `--draggable-card-text` | `--map-card-text` | `#fff` |
| `--draggable-font-family` | `--map-font-family` | `inherit` |
| `--draggable-font-size-xs` | `--map-font-size-xs` | `10px` |
| `--draggable-font-size-2xl` | `--map-font-size-2xl` | `20px` |
| `--draggable-font-weight-medium` | `--map-font-weight-medium` | `500` |
| `--draggable-line-height` | `--map-line-height` | `1.4` |
| `--draggable-padding-header` | `--map-padding-header` | `0 4px 0 8px` |
| `--draggable-radius` | — | `0px` |
| `--draggable-shadow` | — | `none` |
| `--draggable-mask-bg` | — | `rgba(0, 0, 0, 0.45)` |
| `--draggable-z-modal` | — | `10000` |
| `--draggable-header-height` | — | `48px` |

## Variant: `plain`

Set `variant="plain"` on `DraggableContainer` to add class `draggable-variant-plain` on the root. Cards become transparent/inherit (no GIS chrome borders/shadows).

```vue
<DraggableContainer variant="plain" />
```

```tsx
<DraggableContainer variant="plain" />
```

## Example tokens

```css
:root {
  --draggable-card-bg: #1e293b;
  --draggable-card-text: #f8fafc;
  --draggable-radius: 8px;
  --draggable-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  --draggable-mask-bg: rgba(15, 23, 42, 0.5);
}
```
