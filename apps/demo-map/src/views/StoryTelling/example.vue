<script setup lang="ts">
import { type MapSimple } from '@hungpvq/shared-map';
import { BaseMapControl } from '@hungpvq/vue-map-basemap';
import {
  CrsControl,
  FullScreenControl,
  GeoLocateControl,
  getMap,
  GotoControl,
  HomeControl,
  Map,
  MapCard,
  MouseCoordinatesControl,
  SettingControl,
  ZoomControl,
} from '@hungpvq/vue-map-core';
import { MeasurementControl } from '@hungpvq/vue-map-measurement';
import { ref } from 'vue';
import {
  createCustomAction,
  createDrawRouteAction,
  createHighlightAction,
  createOrbitAction,
  createOrbitCurrentCenterAction,
  createPanAction,
  createRotateAction,
  createZoomAction,
} from './helper-action';
import { useMapStorytelling } from './useStorytelling';
const mapRef = ref();
const mapId = ref('');
function onMapLoaded(_map: MapSimple) {
  mapId.value = _map.id;
  getMap(_map.id, (map) => {
    map.addSource('route', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id: 'line-layer',
      type: 'line',
      source: 'route',
      paint: {
        'line-color': '#FF0000', // line color
        'line-width': 4, // line width
        'line-opacity': 0.8, // line opacity
      },
    });
  });
}
const chapters = [
  {
    id: '1',
    duration: 3000,
    actions: [createZoomAction([105.85, 21.03], 12)],
  },
  {
    id: '2',
    duration: 3000,
    actions: [createPanAction([105.82, 21.07])],
  },
  {
    id: '3',
    duration: 3000,
    actions: [createRotateAction(180)],
  },
  {
    id: '4',
    duration: 3000,
    actions: [
      createDrawRouteAction({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [105.84, 21.03],
                [105.85, 21.05],
                [105.86, 21.07],
              ],
            },
          },
        ],
      }),
    ],
  },
  {
    id: '5',
    duration: 3000,
    actions: [createHighlightAction('#btn-highlight')],
  },
  {
    id: '6',
    duration: 6000,
    actions: [createOrbitAction([105.85, 21.0], 0.005, 6000)],
  },
  {
    id: '8',
    duration: 3000,
    actions: [
      createCustomAction(
        'log',
        () => console.log('Chapter 9 started'),
        () => console.log('Chapter 9 ended')
      ),
    ],
  },
  {
    id: '9',
    duration: 3000,
    actions: [createZoomAction([105.86, 21.08], 15)],
  },
  {
    id: '6',
    duration: 6000,
    actions: [createOrbitCurrentCenterAction(0.005, 6000)],
  },
];

const { play, pause, next, prev, isPlaying, currentIndex } = useMapStorytelling(
  mapId,
  {
    chapters,
    autoPlay: false,
    autoNext: true,
    loop: false,
  }
);
</script>
<template>
  <Map ref="mapRef" @map-loaded="onMapLoaded">
    <MeasurementControl position="top-right" />
    <GotoControl position="top-right" />
    <CrsControl />
    <SettingControl />
    <GeoLocateControl />
    <FullScreenControl />
    <ZoomControl />
    <HomeControl />
    <MouseCoordinatesControl />
    <BaseMapControl position="bottom-left" />
    <div class="buttons-container">
      <MapCard>
        <button @click="play">Play</button>
        <button @click="pause">Pause</button>
        <button @click="prev">Prev</button>
        <button @click="next">Next</button>
        <div style="padding: 8px">
          <div>Current: {{ currentIndex }}</div>
          <div v-if="isPlaying">⏯ Playing</div>
          <div id="btn-highlight"></div>
        </div>
      </MapCard>
    </div>
  </Map>
</template>

<style></style>

<style>
* {
  padding: 0;
  margin: 0;
}

body,
html,
#root {
  height: 100%;
}
.buttons-container {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 99;
  display: flex;
  gap: 8px;
  padding: 8px;
}
.buttons-container button {
  background-color: transparent;
  padding: 8px;
}
.buttons-container button:hover {
  background-color: blue;
}
.highlight {
  background-color: red;
}
#btn-highlight {
  height: 10px;
  width: 100%;
}
</style>
