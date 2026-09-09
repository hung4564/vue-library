# ThemeControl

## Usecase

- Switch map UI chrome (sidebar / popup / card overlays) across named themes.
- **Click** the main button to toggle **light ↔ dark** based on the currently resolved theme’s color scheme.
- **Hover** (or keyboard focus within the group) to open a menu of configured themes, including **Auto**.

Theme classes are applied on `document.documentElement` (e.g. `html.map-theme-light`, `html.map-theme-vibrant`) so teleported UI (context menus) inherits tokens too. Preference is stored in `localStorage` under `hungpvq.map-theme-mode`.

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
