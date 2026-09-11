# ToolbarControl

## Usecase

- Host control buttons that opt into `controlLayout="toolbar"`.
- On mobile (`≤640px`), drive `Map` `buttonInMobile` modes `toolbar` and `menu` (fan-out + overflow).

Mount **one** `<ToolbarControl />` in the map slot whenever you use `buttonInMobile="toolbar"` or `"menu"`, or when any control sets `controlLayout="toolbar"`.

## Props

<!--@include: ./props.md-->

and

| Prop         | Description                                      | Type     | Required | Default |
| ------------ | ------------------------------------------------ | -------- | -------- | ------- |
| `maxVisible` | Override auto overflow band count (advanced)     | `number` | `false`  | auto    |

`ToolbarControl` itself uses `controlLayout="button"` so it is never hidden by mobile promotion.

## Mobile `buttonInMobile`

Set on `<Map>` (see [props](./props.md)):

| Value     | Behavior |
| --------- | -------- |
| `button`  | Corner `#btn` unchanged (default) |
| `toolbar` | Promote eligible controls into one horizontal toolbar host |
| `menu`    | Hide per-control corner `#btn`; fan out clusters by `position` into four corner stacks |

### Menu mode details

- Keep each control’s cluster intact (`row` / `column`); overflow **outside-in** per corner.
- Vertical edge budget shares unused half-space with the opposite stack; reserve same-edge `controlLayout="button"` chrome (e.g. MouseCoordinates).
- Corner More reuses `.map-toolbar-overflow` (pinned inward of the button column).

Demo: `/#/mobile-menu` (`button` / `toolbar` / `menu`); toolbar opt-in: `/#/toolbar`.

## Usage

### Vue

```vue
<script setup lang="ts">
import {
  Map,
  ToolbarControl,
  ZoomControl,
  HomeControl,
  MouseCoordinatesControl,
} from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
</script>

<template>
  <Map button-in-mobile="menu">
    <ToolbarControl />
    <ZoomControl position="bottom-right" />
    <HomeControl position="bottom-right" />
    <MouseCoordinatesControl />
  </Map>
</template>
```

### React

```tsx
import {
  Map,
  ToolbarControl,
  ZoomControl,
  HomeControl,
  MouseCoordinatesControl,
} from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map buttonInMobile="menu">
  <ToolbarControl />
  <ZoomControl position="bottom-right" />
  <HomeControl position="bottom-right" />
  <MouseCoordinatesControl />
</Map>
```
