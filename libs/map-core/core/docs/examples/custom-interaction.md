# Ví dụ: Tương tác tra cứu & Đo đạc (Custom Interaction)

Ví dụ này minh họa cách kết hợp tính năng tra cứu thuộc tính (Identify popup) và bộ công cụ đo khoảng cách, diện tích trên bản đồ.

---

## 1. Yêu cầu nghiệp vụ
* Khi người dùng click vào đối tượng thửa đất/công trình: hiển thị popup thông tin chi tiết.
* Cung cấp thanh công cụ đo đạc không gian để người dùng tự do đo khoảng cách đường thẳng hoặc chu vi/diện tích khu đất.

---

## 2. Mã nguồn hoàn chỉnh (Vue 3)

```vue
<template>
  <div class="map-view">
    <Map :map-id="mapId" :options="mapOptions" @load="onMapReady">
      <ZoomControl position="top-right" />
      
      <!-- Công cụ đo khoảng cách & diện tích -->
      <MeasurementControl position="top-right" />
      
      <!-- Popup tự động hiển thị khi click vào đối tượng -->
      <IdentifyControl />

      <LayerControl position="top-left" />
    </Map>
  </div>
</template>

<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { 
  Map, 
  ZoomControl, 
  MeasurementControl 
} from '@hungpvq/vue-map-core';
import { 
  LayerControl, 
  IdentifyControl, 
  useMapDataset 
} from '@hungpvq/vue-map-dataset';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';

const mapId = 'interaction-map';
const { addDataset } = useMapDataset(mapId);

const mapOptions = {
  center: [105.84, 21.03],
  zoom: 13,
};

const onMapReady = async (map: MapSimple) => {
  // Thêm dữ liệu có thuộc tính phong phú để kiểm tra Identify
  const parcels = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          'Mã thửa': 'T-1029',
          'Chủ sở hữu': 'Nguyễn Văn A',
          'Diện tích': '250 m²',
          'Mục đích SD': 'Đất ở đô thị',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [[105.835, 21.030], [105.840, 21.030], [105.840, 21.035], [105.835, 21.035], [105.835, 21.030]]
          ]
        }
      }
    ]
  };

  const dataset = await createGeoJsonDataset({
    id: 'parcels-layer',
    name: 'Thửa đất quy hoạch',
    data: parcels as any,
    color: '#8b5cf6',
  });

  await addDataset(dataset);
};
</script>
```
