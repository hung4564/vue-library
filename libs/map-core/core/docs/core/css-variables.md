# CSS Variables Reference

All CSS variables in the map library use the `--map-` prefix for consistent scoping and to prevent naming conflicts. The variables follow a hierarchical structure: **Global Theme** -> **Component Specific Mapping**.

## 🎨 Global Theme (Common Colors)

Use these variables to customize the look and feel of the entire map library.

```css
:root {
  /* Brand / Primary */
  --map-primary-color: #004e98;
  --map-primary-hover-color: #003a72;
  --map-on-primary-color: #ffffff;

  /* Surfaces & Backgrounds */
  --map-surface-color: #ffffff;
  --map-surface-variant-color: #f5f5f5;
  --map-background-color: #ffffff;

  /* Text Colors */
  --map-text-primary: #333333;
  --map-text-secondary: #666666;
  --map-text-inverse: #ffffff;

  /* Borders & Outlines */
  --map-border-color: #cccccc;
  --map-divider-color: #eeeeee;

  /* States */
  --map-disabled-color: rgba(0, 0, 0, 0.25);
  --map-hover-color: #f5f5f5;
}
```

## 🧩 Component Specific Mapping

Below is the list of specific variables for each component and their default values (which usually point back to the Global Theme).

### Core - MapControlButton / MapButton

Stable root: `MapControlButton` (Vue/React map-core). Experimental chrome: `MapButton` on `./fields` (also used internally by `MapControlButton`).

**`variant`:** `icon` (default, circular toolbar) · `plain` (transparent icon) · `text` · `tonal` · `outlined` · `filled` (primary CTA; label uses `--map-on-primary-color`).

**`size`:** `small` (24px) · `medium` (32px, default) · `large` (40px), or a numeric px value. Applies to **every** variant (`icon`/`plain` → square hit box; label variants → `min-height` + horizontal padding + font).

```vue
<MapControlButton variant="plain" size="small" />
<MapControlButton variant="filled" size="large">Save</MapControlButton>
```

CSS classes: `map-control-button--{variant}`, `map-control-button--size-{small|medium|large}`.

| Token / class | Role | Default |
| --- | --- | --- |
| `--map-button-size` | Label-variant min-height; set by size class | `32px` (`medium`) |
| `--map-button-pad-x` | Label-variant horizontal padding | `12px` |
| `--map-button-font-size` | Label-variant font size | `12px` |
| `--map-button-bg` | Icon chrome background | `var(--map-surface-color, #ffffff)` |
| `--map-button-active-color` | Active icon color | `var(--map-primary-color, #004e98)` |
| `--map-button-hover-bg` | Default hover fill | `var(--map-hover-color, #f5f5f5)` |
| `--map-button-disabled-color` | Disabled icon color | `var(--map-disabled-color, rgba(0,0,0,0.25))` |
| `--map-on-primary-color` | `filled` label on accent | `var(--map-text-inverse, #fff)` |

Guidance: dense lists (layer rows) → `size="small"`; header / toolbar beside draggable chrome → `medium` (matches 32×32 `hungpvq-draggable-button`).

### Core - General (Map/Card)

- `--map-card-bg`: themed translucent overlays (light = near-white; vibrant/ocean/forest/sunset = tinted panels; dark/slate = dark overlays)
- `--map-card-text`: follows theme text
- `--map-card-highlight-bg`: accent / primary highlight

Named classes: `map-theme-light`, `map-theme-dark`, `map-theme-vibrant`, `map-theme-ocean`, `map-theme-forest`, `map-theme-sunset`, `map-theme-slate`.

| Theme | Feel |
| --- | --- |
| `light` | Neutral white + blue |
| `dark` | Charcoal + sky blue |
| `vibrant` | Lavender panels + purple/magenta |
| `ocean` | Aqua panels + teal/cyan |
| `forest` | Sage panels + green |
| `sunset` | Peach panels + coral/amber |
| `slate` | Steel dark + cyan accent |

Draggable overlays alias these as `--card-background-color` / `--card-color`. Apply a theme class on `html` (or use [`ThemeControl`](./module/ThemeControl.md) / `bootstrapMapTheme()`).

### Measurement - MeasurementControl

- `--map-measurement-primary`: `var(--map-primary-color, #004e98)`

### Dataset - LayerList / Menu

- `--map-layer-menu-bg`: `#ecf0f1` (Specific light grey)
- `--map-layer-menu-text`: `var(--map-text-primary, #333)`
- `--map-layer-menu-hover-bg`: `var(--map-primary-color, #004e98)`
- `--map-layer-menu-hover-text`: `var(--map-text-inverse, #fff)`

### Dataset - IdentifyControl

- `--map-identify-box-bg`: `rgba(255, 255, 255, 0.19)`
- `--map-identify-primary`: `var(--map-primary-color, #1a73e8)`

### Dataset - ListItem

- `--map-list-item-active-bg`: `var(--map-primary-color, #1a73e8)`
- `--map-list-item-active-text`: `var(--map-text-inverse, #fff)`
- `--map-list-item-active-outline`: `var(--map-primary-color, #1a73e8)`

### Draw - InspectControl

- `--map-inspect-text`: `var(--map-text-primary, #333)`
- `--map-inspect-border`: `var(--map-border-color, #ccc)`

### Draw - DrawControl (Advanced)

- `primaryColor`: Initializer primary color for drawing layers.
- `activeColor`: Initializer active/selected color for drawing layers.

### Draw - DrawToolbar

- `--map-draw-badge-bg`: `var(--map-primary-color, #004e98)`
- `--map-draw-badge-text`: `var(--map-text-inverse, white)`

### Basemap Module

- `--map-basemap-active-color`: `var(--map-primary-color, #1a73e8)`
- `--map-basemap-tag-bg`: `var(--map-primary-color, #1a73e8)`

## 🎨 Standard Themes Usage

We provide pre-defined themes in `map/core/src/styles/themes.css`.

### How to use:

1. **Import styles** in your entry file (e.g., `main.ts` or `App.vue`):

```typescript
import '@hungpvq/vue-map-core/src/styles/themes.css';
```

2. **Apply class** to a parent element (e.g., body or app wrapper):

```html
<!-- Dark Theme -->
<div class="map-theme-dark">...</div>
```

## 🚀 Manual Customization

```css
/* Override colors globally */
:root {
  --map-primary-color: #ff5722;
  --map-text-primary: #212121;
}

/* Dark Mode support */
[data-theme='dark'] {
  --map-surface-color: #1e1e1e;
  --map-text-primary: #e0e0e0;
  --map-border-color: #424242;
}
```
