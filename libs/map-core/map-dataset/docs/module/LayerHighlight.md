# Layer Highlight

Listens to map click / hover and paints highlight layers from identify + highlight dataset nodes. Invisible (no toolbar).

**Events:** none.

## Props

<!--@include: ../../core/module/props.md-->

| Prop | Type | Default | Effect |
| --- | --- | --- | --- |
| `enableClick` | `boolean` | `false` | Highlight on click |
| `enableHover` | `boolean` | `false` | Highlight on mousemove |
| `color` | `string` | `'#004E98'` | Fallback color when the dataset has no highlight node |
| `durationMs` | `number` | `5000` | Click highlight duration (ms) |

Add a highlight leaf on the dataset for custom paint; otherwise a default highlight is used.

## Vue

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LayerHighlight } from '@hungpvq/vue-map-dataset';
</script>

<template>
  <Map>
    <LayerHighlight enable-click enable-hover color="#e74c3c" :duration-ms="3000" />
  </Map>
</template>
```

## React

```tsx
<LayerHighlight enableClick enableHover color="#e74c3c" durationMs={3000} />
```

Pair with `createDatasetPartHighlightComponent()` on the dataset (see [Highlight](../create-dataset/highlight.md)).
