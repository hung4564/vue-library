<script setup lang="ts">
import { BaseMapCard, BaseMapControl } from '@hungpv97/vue-map-basemap';
import type { MapSimple } from '@hungpv97/shared-map';
import {
  CrsControl,
  FullScreenControl,
  GeoLocateControl,
  GotoControl,
  HomeControl,
  Map,
  MouseCoordinatesControl,
  SettingControl,
  ZoomControl,
} from '@hungpv97/vue-map-core';
import {
  DrawControl,
  DrawingType,
  LayerDrawBuild,
} from '@hungpv97/vue-map-draw';
import {
  IdentifyControl,
  LayerControl,
  LayerMapBuild,
  LayerSimpleMapboxBuild,
  addLayer,
  createGeoJsonLayer,
  createRasterUrlLayer,
} from '@hungpv97/vue-map-layer';
import { MeasurementControl } from '@hungpv97/vue-map-measurement';
import { PrintAdvancedControl, PrintControl } from '@hungpv97/vue-map-print';
function onMapLoaded(map: MapSimple) {
  addLayer(
    map.id,
    createRasterUrlLayer({
      name: 'raster 1',
      tiles: [
        'https://naturalearthtiles.roblabs.com/tiles/natural_earth_cross_blended_hypso_shaded_relief.raster/{z}/{x}/{y}.png',
      ],
      bounds: [
        104.96327341667353, 18.461221184685627, 106.65936430823979,
        19.549518287564368,
      ],
    })
  );

  addLayer(
    map.id,
    createGeoJsonLayer({
      name: 'geojson 1',
      type: 'line',
      color: '#ff0000',
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              id: '1',
              name: 'feature 2',
            },
            geometry: {
              coordinates: [
                [
                  [104.96327341667353, 19.549518287564368],
                  [104.96327341667353, 18.461221184685627],
                  [106.65936430823979, 18.461221184685627],
                  [106.65936430823979, 19.549518287564368],
                  [104.96327341667353, 19.549518287564368],
                ],
              ],
              type: 'Polygon',
            },
          },
        ],
      },
      builds: [
        new LayerMapBuild().setLayers([
          new LayerSimpleMapboxBuild()
            .setStyleType('area')
            .setColor('#0000FF')
            .build(),
          new LayerSimpleMapboxBuild()
            .setStyleType('point')
            .setColor('#ff0000')
            .build(),
        ]),
        new LayerDrawBuild().setDrawSupport([
          DrawingType.POINT,
          DrawingType.POLYGON,
          DrawingType.LINE_STRING,
        ]),
      ],
    })
  );
}
</script>
<template>
  <Map @map-loaded="onMapLoaded">
    <MeasurementControl position="top-right" />
    <DrawControl position="top-right" />
    <IdentifyControl position="top-right" />
    <GotoControl position="top-right" />
    <LayerControl position="top-left">
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <PrintAdvancedControl />
    <PrintControl />
    <CrsControl />
    <SettingControl />
    <GeoLocateControl />
    <FullScreenControl />
    <ZoomControl />
    <HomeControl />
    <MouseCoordinatesControl />
    <BaseMapControl position="bottom-left" />
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
</style>
