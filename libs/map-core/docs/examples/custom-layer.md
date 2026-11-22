# Ví dụ: Thêm & Quản lý lớp tùy biến (Custom Layer)

Ví dụ này hướng dẫn cách tải một file GeoJSON từ server hoặc API, định nghĩa style màu sắc và đưa vào cây danh mục `<LayerControl>` để người dùng tự do bật/tắt hoặc điều chỉnh độ mờ.

---

## 1. Yêu cầu nghiệp vụ
* Tải dữ liệu ranh giới các quận/huyện từ URL API.
* Hiển thị đa giác với màu fill xanh trong suốt và viền xanh đậm.
* Đồng bộ vào `<LayerControl>` để người dùng có thể kéo trượt Opacity từ 0% đến 100%.

---

## 2. Mã nguồn hoàn chỉnh (Vue 3)

```vue
<template>
  <div class="map-view">
    <Map :map-id="mapId" :options="mapOptions" @load="loadCustomData">
      <ZoomControl position="top-right" />
      <BaseMapControl position="top-right" />
      
      <!-- Cây danh mục hiển thị các layer đã thêm -->
      <LayerControl position="top-left" />
    </Map>
  </div>
</template>

<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { Map, ZoomControl, BaseMapControl } from '@hungpvq/vue-map-core';
import { LayerControl, useMapDataset } from '@hungpvq/vue-map-dataset';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';
import { resolveDatasetBbox } from '@hungpvq/map-dataset';
import { fitBounds } from '@hungpvq/map-core';

const mapId = 'custom-layer-map';
const { addDataset } = useMapDataset(mapId);

const mapOptions = {
  center: [105.85, 21.03],
  zoom: 11,
};

const loadCustomData = async (map: MapSimple) => {
  // Dữ liệu GeoJSON mẫu (2 đa giác)
  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Khu vực 1', code: 'KV-01' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [[105.82, 21.02], [105.86, 21.02], [105.86, 21.05], [105.82, 21.05], [105.82, 21.02]]
          ]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Khu vực 2', code: 'KV-02' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [[105.86, 21.01], [105.90, 21.01], [105.90, 21.04], [105.86, 21.04], [105.86, 21.01]]
          ]
        }
      }
    ]
  };

  // 1. Tạo Dataset
  const dataset = await createGeoJsonDataset({
    id: 'regions-layer',
    name: 'Phân vùng quản lý',
    data: geojson as any,
    color: '#0ea5e9',
    opacity: 0.7,
  });

  // 2. Thêm vào bản đồ & LayerControl
  await addDataset(dataset);

  // 3. Tự động zoom đến vùng dữ liệu
  const bbox = await resolveDatasetBbox(dataset);
  if (bbox) {
    fitBounds(map, bbox, { padding: 40 });
  }
};
</script>
```
