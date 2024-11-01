<script setup lang="ts">
import type { MapSimple } from '@hungpvq/shared-map';
import { BaseMapCard, BaseMapControl } from '@hungpvq/vue-map-basemap';
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
} from '@hungpvq/vue-map-core';
import {
  DrawControl,
  DrawingType,
  LayerDrawBuild,
} from '@hungpvq/vue-map-draw';
import {
  IdentifyControl,
  LayerBuilder,
  LayerControl,
  LayerSimpleMapboxBuild,
  addLayer,
  createGeoJsonLayer,
  createRasterUrlLayer,
} from '@hungpvq/vue-map-layer';
import { MeasurementControl } from '@hungpvq/vue-map-measurement';
import { PrintAdvancedControl, PrintControl } from '@hungpvq/vue-map-print';
import AsideControl from '../layout/aside-control.vue';
function onMapLoaded(map: MapSimple) {
  addLayer(
    map.id,
    createRasterUrlLayer({
      name: 'raster 1',
      tiles: [
        'https://naturalearthtiles.roblabs.com/tiles/natural_earth_cross_blended_hypso_shaded_relief.raster/{z}/{x}/{y}.png',
      ],
      maxZoom: 6,
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
        LayerBuilder.map().setLayers([
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
    <AsideControl position="top-left" show />
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
