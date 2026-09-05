# Extra CRS

## CrsControl

### Props

<!--@include: ./module/props.md-->

#### Events

#### Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

#### Usage

##### Vue

```vue
<script setup lang="ts">
import { Map, CrsControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
</script>

<template>
  <Map>
    <CrsControl />
  </Map>
</template>
```

##### React

```tsx
import { Map, CrsControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map>
  <CrsControl />
</Map>
```

---

## How to Use Store, Hook, and Add a CRS

### 1. Using the Store

The CRS store manages the list of available coordinate reference systems (CRS) and the current selection for each map instance.

**Import:**

```ts
// Vue
import { useMapCrsStore } from '@hungpvq/vue-map-core';

// React
import { useMapCrsStore } from '@hungpvq/react-map-core';
```

**Example:**

```ts
const store = useMapCrsStore(mapId);
// Get current CRS
console.info(store.crs);
// Get all CRS items
console.info(store.items);
// Set current CRS
store.crs = '4326';
```

### 2. Using the Hook

Hooks provide a reactive way to work with CRS items and the current CRS.

**Import:**

```ts
// Vue
import { useMapCrsItems, useMapCrsCurrent } from '@hungpvq/vue-map-core';

// React
import { useMapCrsItems, useMapCrsCurrent } from '@hungpvq/react-map-core';
```

**Usage:**

```ts
// Work with the list of CRS
const { items, setItems } = useMapCrsItems(mapId);
// Work with the current CRS
const { item, setItem, isCrsDegree } = useMapCrsCurrent(mapId);

// Set the current CRS by EPSG code
setItem('4326');

// Add a new CRS to the list
setItems([
  ...(Array.isArray(items) ? items : items.value),
  {
    name: 'Custom CRS',
    epsg: '9999',
    unit: 'meter',
    proj4js: '+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs',
  },
]);
```

### 3. Adding a New CRS

To add a new CRS, simply push a new CRS object to the items array and update the store using `setItems`.

**Example:**

```ts
const newCrs = {
  name: 'Custom CRS',
  epsg: '9999',
  unit: 'meter',
  proj4js: '+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs',
};
setItems([...(Array.isArray(items) ? items : items.value), newCrs]);
```

---

#### Summary

- Use `useMapCrsStore` for direct access to the CRS store (current CRS, CRS list).
- Use `useMapCrsItems` and `useMapCrsCurrent` hooks for reactive CRS management in components.
- Add a new CRS by updating the items array with `setItems`.
