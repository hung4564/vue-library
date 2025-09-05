# InspectControl

## Usecase

- Inspect rendered features for debugging data and styles.
- Provide quick identify functionality without building a full query UI.

## Props

<!--@include: ../../core/module/props.md-->

and

| Prop                         | Description                               | Type       | Required | Default Value          |
| ---------------------------- | ----------------------------------------- | ---------- | -------- | ---------------------- |
| `showInspectDefault`         | Show inspect mode by default              | `boolean`  | false    | `false`                |
| `useInspectStyle`            | Use inspect style for layers              | `boolean`  | false    | `true`                 |
| `showInspectMapPopup`        | Show popup for inspected features         | `boolean`  | false    | `true`                 |
| `showInspectMapPopupOnHover` | Show popup on hover                       | `boolean`  | false    | `false`                |
| `showMapPopup`               | Show generic map popup                    | `boolean`  | false    | `false`                |
| `showMapPopupOnHover`        | Show map popup on hover                   | `boolean`  | false    | `true`                 |
| `blockHoverPopupOnClick`     | Block hover popup on click                | `boolean`  | false    | `false`                |
| `buildInspectStyle`          | Custom style builder function             | `Function` | false    | `generateInspectStyle` |
| `backgroundColor`            | Background color for inspect style        | `string`   | false    | `'#fff'`               |
| `assignLayerColor`           | Function to assign color to layers        | `Function` | false    | `brightColor`          |
| `renderPopup`                | Function to render popup content          | `Function` | false    | `_renderPopup`         |
| `selectThreshold`            | Pixel threshold for feature selection     | `number`   | false    | `5`                    |
| `queryParameters`            | Parameters for querying rendered features | `object`   | false    | `() => ({})`           |

## Slots

| Name      | Description         |
| --------- | ------------------- |
| `default` | Custom content slot |

## Usage Notes

- Use inside a `<Map>` component from `@hungpvq/vue-map-core`.
- Useful for debugging and analyzing map layers and features.
- Highly customizable via props for popup rendering and style.
- Supports slot for custom UI extension.

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { InspectControl } from '@hungpvq/vue-map-draw';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-draw/style.css';
</script>

<template>
  <Map>
    <InspectControl />
  </Map>
</template>
```
