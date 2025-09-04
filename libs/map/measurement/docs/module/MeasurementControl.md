## 📚 MeasurementControl

### Usecase

- Measure distance/area for planning and reporting tasks.
- Offer ad-hoc measurement tools without leaving the map view.

The `MeasurementControl` component provides a user interface for measuring distances, areas, and angles on the map. It is highly configurable and supports custom actions, multiple units, and event hooks for integration with your application logic.

### Props

<!--@include: ../../core/module/props.md-->

and

| Prop      | Type                  | Default | Description                |
| --------- | --------------------- | ------- | -------------------------- |
| `actions` | `MeasureActionItem[]` | `[]`    | Custom measurement actions |

### Types

```typescript
interface MeasureActionItem {
  title: string;
  handle: (data: { handler: MeasurementHandleType; measurementType?: string; coordinates?: CoordinatesNumber[]; clear: () => void; reset: () => void; onFlyTo: () => void }) => void;
  icon: any;
  type: string;
  show?: (data: { handler: MeasurementHandleType; measurementType?: string; status: 'select' | 'handle' }) => boolean;
  isActive?: () => boolean;
  disabled?: (data: { coordinates?: CoordinatesNumber[] }) => boolean;
  index?: number;
}
```

### Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { MeasurementControl } from '@hungpvq/vue-map-measurement';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-measurement/style.css';
</script>

<template>
  <Map>
    <MeasurementControl />
  </Map>
</template>
```
