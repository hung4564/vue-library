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

Example:

```css
:root {
  --draggable-card-bg: #1e293b;
  --draggable-card-text: #f8fafc;
}
```
