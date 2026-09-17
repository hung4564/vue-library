# ThemeControl

## Usecase

- Switch map UI chrome (sidebar / popup / card overlays) across named themes.
- **Click** the main button to toggle **light ↔ dark** based on the currently resolved theme’s color scheme.
- **Hover** (or keyboard focus within the group) to open a menu of configured themes, including **Auto**.

Theme classes are applied on `document.documentElement` (e.g. `html.map-theme-light`, `html.map-theme-vibrant`) so teleported UI (context menus) inherits tokens too. Preference is stored in `localStorage` under `hungpvq.map-theme-mode`.

**Multi-map contract:** theme mode is **process-global by default** (one preference + `html.map-theme-*` for the whole page). Multiple maps share the same document chrome theme. For an advanced per-map chrome override on `.map-container[data-map-id]`, see [Optional: per-map theme override](#optional-per-map-theme-override-advanced) (`applyMapThemeForMap`).

When the OS requests **more contrast** (`prefers-contrast: more`), the control / `bootstrapMapTheme` also toggles `html.map-theme-contrast` (stronger borders and focus rings). Live updates use `subscribePrefersContrastMore`.

## Behavior

### Click (main button)

1. Resolve the current mode (`resolveMapTheme(mode)`).
2. If `MAP_THEME_COLOR_SCHEME[resolved] === 'dark'` → set mode to `'light'`, otherwise → `'dark'`.

Examples: `auto` resolving to dark → click sets `light`; `vibrant` / `ocean` (light scheme) → click sets `dark`; `slate` → click sets `light`.

The main icon shows the **target** of that toggle (sun when the current scheme is dark, moon when light).

### Hover / focus-within

Expands a row button group listing every mode in the `themes` prop. Pick a theme to set mode, persist, and apply. The active item matches the stored mode (`auto` is active only when mode is `auto`).

| Mode | Behavior |
| --- | --- |
| `auto` | Resolves to `light` or `dark` via `prefers-color-scheme` |
| `light` | Neutral white chrome + blue |
| `dark` | Charcoal overlay + sky blue |
| `vibrant` | Lavender panels + purple / magenta |
| `ocean` | Aqua panels + teal / cyan |
| `forest` | Sage panels + green |
| `sunset` | Peach panels + coral / amber |
| `slate` | Steel dark overlay + cyan accent |

Bootstrap without the control:

```ts
import { bootstrapMapTheme } from '@hungpvq/map-core/theme';

bootstrapMapTheme('auto');
// or force a named theme:
bootstrapMapTheme('vibrant');
```

Helpers: `MAP_THEME_IDS`, `MAP_THEME_MODES`, `resolveMapTheme`, `applyMapThemeClass`, `toggleMapThemeLightDark`, `normalizeMapThemeModes` (`cycleMapThemeMode` still available).

**Multi-map:** theme mode is **process-global** by default (class on `html` + `MAP_THEME_STORAGE_KEY`). Multiple map shells share the same chrome theme. See [Map store](../map-store.md#multi-map-caveats-apps-with-map-a--map-b).

### Optional: per-map theme override (advanced)

`ThemeControl` / `bootstrapMapTheme` stay **document-global** — do not change that for normal apps.

CSS already scopes tokens on any ancestor with `.map-theme-*` (not only `html`). For a one-off map that needs a different chrome theme:

```ts
import {
  applyMapThemeForMap,
  resolveMapTheme,
  type MapThemeMode,
} from '@hungpvq/map-core/theme';

function setMapChromeTheme(mapId: string, mode: MapThemeMode) {
  // Applies to `.map-container[data-map-id="…"]` only — does not touch `html`.
  applyMapThemeForMap(mapId, resolveMapTheme(mode));
}
```

Notes:

- Call after the Map shell is mounted (`data-map-id` present); otherwise `applyMapThemeForMap` returns `false`.
- UI teleported **outside** that container still follows the document (`html`) theme.
- Prefer this helper over forking `ThemeControl` unless you need a full per-map control UX (future major if built-in).

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `themes` | `MapThemeMode[]` | `MAP_THEME_MODES` | Modes shown in the hover menu. Invalid ids are filtered out. |

<!--@include: ./props.md-->

Limit which themes appear:

```tsx
<ThemeControl themes={['auto', 'light', 'dark', 'vibrant']} />
```

```vue
<ThemeControl :themes="['auto', 'light', 'dark', 'vibrant']" />
```

## Usage

### Vue

```vue
<script setup lang="ts">
import { Map, ThemeControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
</script>

<template>
  <Map>
    <ThemeControl />
  </Map>
</template>
```

### React

```tsx
import { Map, ThemeControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map>
  <ThemeControl />
</Map>
```
