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

```vue
<script setup lang="ts">
import { Map, CrsControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
</script>

<template>
  <Map>
    <CrsControl />
  </Map>
</template>
```

---

## How to Use Store, Hook, and Add a CRS

### 1. Using the Store

The CRS store manages the list of available coordinate reference systems (CRS) and the current selection for each map instance.

**Import:**

```ts
import { useMapCrsStore } from '@hungpvq/vue-map-core';
```

**Example:**

```ts
const store = useMapCrsStore(mapId);
// Get current CRS
console.log(store.crs);
// Get all CRS items
console.log(store.items);
// Set current CRS
store.crs = '4326';
```

### 2. Using the Hook

Hooks provide a reactive way to work with CRS items and the current CRS.

**Import:**

```ts
import { useMapCrsItems, useMapCrsCurrent } from '@hungpvq/vue-map-core';
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
  ...items.value,
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
setItems([...items.value, newCrs]);
```

---

#### Summary

- Use `useMapCrsStore` for direct access to the CRS store (current CRS, CRS list).
- Use `useMapCrsItems` and `useMapCrsCurrent` hooks for reactive CRS management in components.
- Add a new CRS by updating the items array with `setItems`.
