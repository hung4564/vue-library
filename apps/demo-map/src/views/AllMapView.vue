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
  langStore,
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
  langStore.setMapLang(map.id, {
    map: {
      basemap: {
        title: 'Bản Đồ nền',
        setting: 'Cài Đặt',
      },
      'crs-control': {
        title: 'Cài đặt CRS',
        field: {
          name: 'tên',
          unit: 'đơn vị',
          epsg: 'EPSG',
          proj4js: 'proj4js',
        },
      },
      action: {
        'fullscreen-control-enter': 'Toàn màn hình',
        'fullscreen-control-exit': 'Thoát toàn màn hình',
        'geolocate-control-find-my-location': 'Tìm vị trí của tôi',
        'geolocate-control-location-not-available': 'Vị trí không có sẵn',
        'navigation-control-zoom-in': 'Phóng to',
        'navigation-control-zoom-out': 'Thu phóng ra',
        'navigation-control-reset-bearing': 'Đặt lại về phía bắc',
      },
      'goto-control': {
        title: 'Đi đến',
        field: {
          zoom: 'Phóng',
          center: 'Trung tâm',
          sprite: 'URL sprite',
          glyphs: 'Url glyphs',
        },
        btn: {
          apply: 'Đi đến',
        },
      },
      home: {
        title: 'Trang chủ',
      },
      'setting-control': {
        title: 'Cài đặt',
        field: {
          zoom: 'Phóng',
          center: 'Trung tâm',
          sprite: 'URL sprite',
          glyphs: 'Url glyphs',
        },
        btn: {
          apply: 'Áp dụng',
        },
      },
      'layer-control': {
        title: 'Kiểm soát lớp',
        'create-btn': 'Tạo lớp',
        create: {
          title: 'Lớp mới',
        },
        field: {
          name: 'Tên',
          type: 'Kiểu',
          url: 'URL',
          minzoom: 'Thu phóng tối thiểu',
          maxzoom: 'Phóng to tối đa',
          file: 'Tài liệu',
          geojson: 'Geojson',
          tiles: 'Gạch',
          bound: {
            title: 'Ràng buộc',
            minx: 'Kinh độ tối thiểu',
            miny: 'Vĩ độ tối thiểu',
            maxx: 'Kinh độ tối đa',
            maxy: 'Vĩ độ tối đa',
          },
        },
        info: {
          title: 'Thông tin',
        },
      },
      identify: {
        title: 'Nhận dạng',
        point: 'Điểm',
      },
      measurement: {
        action: {
          clear: 'Thông thoáng',
          close: 'Đóng',
          setting: 'Cài đặt',
          download: 'Tải xuống',
          'add-point': 'Thêm điểm',
          'fly-to': 'Lấp đầy ràng buộc',
          add: 'Thêm vào',
        },
        title: 'Đo lường',
        result: 'Kết quả đo lường',
        field: {
          'unit-distance': 'Khoảng cách đơn vị',
          'unit-area': 'Khu vực đơn vị',
        },
        tools: {
          point: 'Đo điểm',
          distance: 'Đo khoảng cách',
          area: 'Đo diện tích',
          azimuth: 'Đo góc phương vị',
        },
        unit: {
          meter: 'Mét',
          kilometer: 'Km',
          'square-meter': 'Mét vuông',
          hecta: 'HECTA',
          'square-kilometer': 'Km vuông',
        },
        setting: {
          title: 'Cài đặt',
          field: {
            data: 'Dữ liệu',
          },
          point: 'Điểm',
          distance: 'Khoảng cách',
          area: 'Khu vực',
          azimuth: 'Phương vị',
        },
        'no-data': {
          text: 'Trạng thái',
          value: 'Chờ...',
        },
      },
      print: {
        title: 'In',
        actions: {
          save: 'cứu',
          clear: 'thông thoáng',
          setting: 'Cài đặt',
        },
        setting: {
          title: 'Cài đặt',
        },
        field: {
          ratio: 'Tỷ lệ',
          orientation: 'Định hướng',
        },
        btn: {
          apply: 'In',
        },
      },
    },
  });
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
