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
import * as turf from '@turf/turf';
import { GeoJSONSource, Marker } from 'maplibre-gl';
import { ref } from 'vue';
import { createZoomAction } from './helper-action';
import { withMapReady } from './helper-global';
import { Chapter, useMapStorytelling } from './useStorytelling';

const mapRef = ref();
const mapId = ref('');
let trailCoords: [number, number][] = [];
const trailSourceId = 'gps-trail';
function onMapLoaded(_map: MapSimple) {
  mapId.value = _map.id;
  withMapReady(mapId.value, (map) => {
    marker.setLngLat([gpsTrack[0].lng, gpsTrack[0].lat]).addTo(map);
  });
  withMapReady(mapId.value, (map) => {
    if (!map.getSource(trailSourceId)) {
      map.addSource(trailSourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        },
      });

      map.addLayer({
        id: trailSourceId,
        type: 'line',
        source: trailSourceId,
        paint: {
          'line-color': '#FF0000',
          'line-width': 4,
        },
      });
    }
  });
}

const gpsTrack = [
  { lng: 105.84146352698633, lat: 21.017689539749725, timestamp: 0 },
  { lng: 105.84146352698633, lat: 21.02072355063092, timestamp: 5 },
  { lng: 105.84148852917048, lat: 21.024177580174765, timestamp: 10 },
  { lng: 105.84148852917048, lat: 21.024177580174765, timestamp: 15 },
  { lng: 105.8467139857371, lat: 21.022567265547778, timestamp: 20 },
  { lng: 105.8486391539463, lat: 21.022030490139215, timestamp: 30 },
];

const marker = new Marker({ color: 'red' });

const chapters: Chapter[] = gpsTrack.map((point, index) => {
  const next = gpsTrack[index + 1];
  return {
    id: `point-${index}`,
    duration: next ? (next.timestamp - point.timestamp) * 1000 : 1000, // in milliseconds
    actions: [
      {
        type: 'moveMarkerTo',
        payload: {
          lng: point.lng,
          lat: point.lat,
        },
      },
      // Only create a segment animation if next point exists
      next
        ? {
            type: 'animateSegment',
            payload: {
              segment: {
                start: point,
                end: next,
                duration: (next.timestamp - point.timestamp) * 1000,
              },
            },
          }
        : null,
    ].filter((x) => !!x), // Remove null actions
  };
});
chapters[0].actions?.push(
  createZoomAction([gpsTrack[0].lng, gpsTrack[0].lat], 12)
);
const { play, pause, next, prev, isPlaying, currentIndex } = useMapStorytelling(
  mapId,
  {
    chapters,
    autoPlay: false,
    autoNext: true,
    loop: false,
    globalActions: {
      moveMarkerTo: ({ lng, lat }: { lng: number; lat: number }) => ({
        add: () => {
          marker.setLngLat([lng, lat]);
        },
      }),
      updateTrail: ({ coord }: { coord: [number, number] }) => ({
        add: () => {
          updateTrail(coord);
        },
      }),
      animateSegment: ({
        segment,
        speed = 1,
        onFinish,
      }: {
        segment: any;
        speed?: number;
        onFinish?: () => void;
      }) => ({
        add: () => {
          if (!segment || !segment.start || !segment.end || !segment.duration) {
            console.error('Invalid segment data', segment);
            return;
          }

          const startCoord: [number, number] = [
            segment.start.lng,
            segment.start.lat,
          ];
          const endCoord: [number, number] = [segment.end.lng, segment.end.lat];

          if (isSameCoord(startCoord, endCoord)) {
            console.warn('Skipping segment: start and end are identical');
            onFinish?.(); // Gọi kết thúc luôn để tiếp tục chapter tiếp theo
            return;
          }
          if (!isValidCoordinate(startCoord) || !isValidCoordinate(endCoord)) {
            console.error(
              'Invalid coordinates for segment',
              startCoord,
              endCoord
            );
            return;
          }

          const line = turf.lineString([startCoord, endCoord]);
          const distance = turf.length(line); // km
          const duration = segment.duration / speed;

          let startTime: number | null = null;

          function frame(now: number) {
            if (startTime === null) startTime = now;
            const elapsed = now - startTime;
            const t = Math.min(Math.max(elapsed / duration, 0), 1); // Clamp between 0 and 1

            const interpolated = turf.along(line, distance * t).geometry
              .coordinates as [number, number];

            marker.setLngLat(interpolated);
            updateTrail(interpolated);

            if (t < 1) {
              requestAnimationFrame(frame);
            } else {
              onFinish?.();
            }
          }

          requestAnimationFrame(frame);
        },
      }),
    },
  }
);
function updateTrail(coord: [number, number]) {
  getMap(mapId.value, (map) => {
    trailCoords.push(coord);
    const source = map.getSource(trailSourceId) as GeoJSONSource;
    if (source) {
      source.setData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: trailCoords,
        },
      });
    }
  });
}
// Helper function to validate coordinates
function isValidCoordinate(coord: [number, number]): boolean {
  const [lng, lat] = coord;
  return (
    !isNaN(lng) && !isNaN(lat) && Math.abs(lng) <= 180 && Math.abs(lat) <= 90
  );
}
const isSameCoord = (a: [number, number], b: [number, number]) =>
  a[0] === b[0] && a[1] === b[1];
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
