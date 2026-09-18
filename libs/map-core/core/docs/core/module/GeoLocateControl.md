# GeoLocateControl

Locate the user with the browser Geolocation API, matching **mapboxgl.GeolocateControl**.

Adapter defaults enable **tracking** (`trackUserLocation: true`) and **heading** (`showUserHeading: true`). Pass `track-user-location={false}` / `trackUserLocation={false}` for classic one-shot locate.

With tracking on, the button toggles the watch, pans into **background** if the user moves the map (toolbar stays visually “tracking unlocked”), and click-again flies back. Soft errors (timeout / unavailable) keep the button **enabled** so the user can stop or retry; only permission deny hard-disables the control. The session **reconnects** when permission is granted again or a soft error clears.

## Usecase

- Center the map to the user location on mobile devices.
- Provide a locate-me button for field survey or navigation workflows.

## Props

<!--@include: ./props.md-->

Same option names as mapboxgl.GeolocateControl:

| Prop | Core default | Adapter default | Notes |
| --- | --- | --- | --- |
| `fitBoundsOptions` | `{ maxZoom: 15 }` | same | Passed to `Map#fitBounds` when the camera moves to the user. |
| `followUserLocation` | `true` | `true` | If `false`, the dot updates without moving the camera. Click still centers. |
| `geolocation` | `navigator.geolocation` | same | Inject a Geolocation-shaped object (tests / custom handling). |
| `positionOptions` | `{ enableHighAccuracy: false, timeout: 6000 }` | same | Geolocation `PositionOptions`. |
| `showAccuracyCircle` | `true` | `true` | Accuracy halo. Always off when `showUserLocation` is `false`. |
| `showUserHeading` | `false` | `true` | Heading arrow. Only applies when `trackUserLocation` is `true`. |
| `showUserLocation` | `true` | `true` | Pulsing location marker. |
| `trackUserLocation` | `false` | `true` | Toggle + live updates when `true`. |

Control id / action type: `mapGeoLocateControl`.

## Events

Mapbox-aligned events from the control (and Experimental `GeoLocateSession`):

| Event | Payload | When |
| --- | --- | --- |
| `geolocate` | `GeolocationPosition` | Each successful fix. |
| `error` | `{ message: string; code?: number }` | Geolocation failure (permission / timeout / unavailable). |
| `trackuserlocationstart` | — | Tracking watch starts (`trackUserLocation`). |
| `trackuserlocationend` | — | Tracking stops. |

Toolbar uses `loading` while `GeoLocateUiState.locating` is true (`WAITING_ACTIVE`).

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
    <GeoLocateControl
      @geolocate="onGeolocate"
      @error="onError"
      @trackuserlocationstart="onTrackStart"
      @trackuserlocationend="onTrackEnd"
    />
  </Map>
</template>
```

### React

```tsx
import { Map, GeoLocateControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map>
  <GeoLocateControl
    onGeolocate={onGeolocate}
    onError={onError}
    onTrackUserLocationStart={onTrackStart}
    onTrackUserLocationEnd={onTrackEnd}
  />
</Map>
```
