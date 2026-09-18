# ThemeControl

## Usecase

- Switch map UI chrome (sidebar / popup / card overlays) across named themes.
- **Click** the main button to toggle **light ↔ dark** based on the currently resolved theme’s color scheme.
- **Hover** (or keyboard focus within the group) to open a menu of configured themes, including **Auto**.

### Scope

| `scope` | Classes | Storage | Multi-map |
| --- | --- | --- | --- |
| `document` (default) | `html.map-theme-*` **and** mirror on this map’s `.map-container[data-map-id]` | `hungpvq.map-theme-mode` | One preference for the page |
| `map` | Only `.map-container[data-map-id]` | `hungpvq.map-theme-mode:<mapId>` | Independent theme per map |

Use `scope="map"` when multiple maps on one page need different chrome themes. UI teleported **outside** that container still follows the document (`html`) theme unless you also bootstrap a document theme.

When the OS requests **more contrast** (`prefers-contrast: more`), the control / `bootstrapMapTheme` also toggles `.map-theme-contrast` (stronger borders and focus rings). Live updates use `subscribePrefersContrastMore`.

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

// Per-map bootstrap (no html change):
bootstrapMapTheme('dark', { scope: 'map', mapId: 'my-map' });
```

Helpers: `MAP_THEME_IDS`, `MAP_THEME_MODES`, `resolveMapTheme`, `applyMapTheme` / `applyMapThemeClass` / `applyMapThemeForMap`, `toggleMapThemeLightDark`, `normalizeMapThemeModes`, `getMapThemeStorageKey`.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `themes` | `MapThemeMode[]` | `MAP_THEME_MODES` | Modes shown in the hover menu. Invalid ids are filtered out. |
| `scope` | `'document' \| 'map'` | `'document'` | Where theme classes + preference are applied. |

<!--@include: ./props.md-->

Limit which themes appear:

```tsx
<ThemeControl themes={['auto', 'light', 'dark', 'vibrant']} />
```

```vue
<ThemeControl :themes="['auto', 'light', 'dark', 'vibrant']" />
```

Multi-map independent themes:

```vue
<Map map-id="a"><ThemeControl scope="map" /></Map>
<Map map-id="b"><ThemeControl scope="map" /></Map>
```

```tsx
<Map mapId="a"><ThemeControl scope="map" /></Map>
<Map mapId="b"><ThemeControl scope="map" /></Map>
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
    <!-- or: <ThemeControl scope="map" /> -->
  </Map>
</template>
```

### React

```tsx
import { Map, ThemeControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

export function App() {
  return (
    <Map>
      <ThemeControl />
      {/* or: <ThemeControl scope="map" /> */}
    </Map>
  );
}
```
