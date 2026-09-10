# GeoLocateControl

Locate the user with the browser Geolocation API, matching **mapboxgl.GeolocateControl**.

Default is a **one-shot** locate (`trackUserLocation: false`). With `trackUserLocation`, the button toggles tracking, pans into **background** if the user moves the map, and click-again flies back.

On error: marker / accuracy circle are **removed**, the button is **disabled**, hover shows the error, and the session **reconnects** when permission or a fix returns.

## Usecase

- Center the map to the user location on mobile devices.
- Provide a locate-me button for field survey or navigation workflows.

## Props

<!--@include: ./props.md-->

Same option names as mapboxgl.GeolocateControl:

| Prop | Default | Notes |
| --- | --- | --- |
| `fitBoundsOptions` | `{ maxZoom: 15 }` | Passed to `Map#fitBounds` when the camera moves to the user. |
| `followUserLocation` | `true` | If `false`, the dot updates without moving the camera. Click still centers. |
| `geolocation` | `navigator.geolocation` | Inject a Geolocation-shaped object (tests / custom handling). |
| `positionOptions` | `{ enableHighAccuracy: false, timeout: 6000 }` | Geolocation `PositionOptions`. |
| `showAccuracyCircle` | `true` | Accuracy halo. Always off when `showUserLocation` is `false`. |
| `showUserHeading` | `false` | Heading arrow. Only applies when `trackUserLocation` is `true`. |
| `showUserLocation` | `true` | Pulsing location marker. |
| `trackUserLocation` | `false` | Toggle + live updates when `true`. |

Control id / action type: `mapGeoLocateControl`.

## Events

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

## Usage

### Vue

```vue
<script setup lang="ts">
import { Map, GeoLocateControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
</script>

<template>
  <Map>
    <GeoLocateControl track-user-location show-user-heading />
  </Map>
</template>
```

### React

```tsx
import { Map, GeoLocateControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map>
  <GeoLocateControl trackUserLocation showUserHeading />
</Map>
```
