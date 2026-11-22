# Hướng dẫn bắt đầu nhanh (Quick Start)

Tài liệu này cung cấp các đoạn mã nguồn hoàn chỉnh, chạy được ngay (copy-pasteable) cho 3 môi trường: **Vue 3**, **React 18** và **Vanilla JavaScript / TypeScript**.

---

## 1. Ví dụ hoàn chỉnh với Vue 3

### Bước 1: Khởi tạo ứng dụng trong `main.ts`

Hàm `installMapApp(app)` giúp đăng ký Theme tự động và hệ thống `UniversalRegistry` phục vụ hiển thị menu layer và công cụ tương tác.

```ts
// src/main.ts
import { createApp } from 'vue';
import { installMapApp } from '@hungpvq/vue-map';
import '@hungpvq/vue-map/style.css';
import App from './App.vue';

const app = createApp(App);

// Đăng ký theme, i18n và store plugin
installMapApp(app);

app.mount('#app');
```

### Bước 2: Tạo Component bản đồ `MapDemo.vue`

Trong ví dụ này, ta hiển thị bản đồ, bật các control mặc định, và thêm 1 lớp GeoJSON bằng hàm `createGeoJsonDataset`:

```vue
<template>
  <div class="map-wrapper">
    <Map
      :map-id="mapId"
      :options="mapOptions"
      @load="onMapLoaded"
    >
      <!-- Các nút điều khiển chuẩn -->
      <ZoomControl />
      <HomeControl />
      <BaseMapControl />
      <FullScreenControl />
      
      <!-- Cây quản lý danh sách Layer -->
      <LayerControl />
    </Map>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { MapSimple } from '@hungpvq/map-core';
import { 
  Map, 
  ZoomControl, 
  HomeControl, 
  BaseMapControl, 
  FullScreenControl 
} from '@hungpvq/vue-map-core';
import { LayerControl, useMapDataset } from '@hungpvq/vue-map-dataset';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';

const mapId = 'my-map-app';

// Cấu hình ban đầu của bản đồ (tọa độ trung tâm Việt Nam)
const mapOptions = {
  center: [105.854444, 21.028511], // Hà Nội [lng, lat]
  zoom: 12,
};

// Hook quản lý dataset theo mapId
const { addDataset } = useMapDataset(mapId);

const onMapLoaded = async (map: MapSimple) => {
  console.log('Bản đồ đã sẵn sàng!', map);

  // Tạo một Dataset GeoJSON mẫu
  const sampleGeojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Hồ Hoàn Kiếm', type: 'lake' },
        geometry: {
          type: 'Point',
          coordinates: [105.8524, 21.0287],
        },
      },
    ],
  };

  const dataset = await createGeoJsonDataset({
    id: 'sample-lake-layer',
    name: 'Hồ Hoàn Kiếm',
    data: sampleGeojson,
    color: '#0284c7',
  });

  // Đưa layer lên bản đồ và đồng bộ vào LayerControl
  await addDataset(dataset);
};
</script>

<style scoped>
.map-wrapper {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}
</style>
```

---

## 2. Ví dụ hoàn chỉnh với React 18

### Bước 1: Khởi tạo ứng dụng trong `index.tsx`

```tsx
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { installMapApp } from '@hungpvq/react-map';
import '@hungpvq/react-map/style.css';
import { App } from './App';

// Gọi hàm khởi tạo toàn cục (Theme + Registry)
installMapApp();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
```

### Bước 2: Component `App.tsx`

```tsx
// src/App.tsx
import React, { useCallback } from 'react';
import type { MapSimple } from '@hungpvq/map-core';
import { 
  Map, 
  ZoomControl, 
  HomeControl, 
  BaseMapControl, 
  FullScreenControl 
} from '@hungpvq/react-map-core';
import { LayerControl, useMapDataset } from '@hungpvq/react-map-dataset';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';

export const App: React.FC = () => {
  const mapId = 'react-map-demo';
  const { addDataset } = useMapDataset(mapId);

  const handleMapLoad = useCallback(async (map: MapSimple) => {
    console.log('React Map loaded:', map);

    const geojsonData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Điểm mốc React' },
          geometry: {
            type: 'Point',
            coordinates: [106.7009, 10.7769], // TP. Hồ Chí Minh
          },
        },
      ],
    };

    const dataset = await createGeoJsonDataset({
      id: 'hcm-marker',
      name: 'Điểm đánh dấu Sài Gòn',
      data: geojsonData,
      color: '#ef4444',
    });

    await addDataset(dataset);
  }, [addDataset]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Map
        mapId={mapId}
        options={{
          center: [106.7009, 10.7769],
          zoom: 13,
        }}
        onLoad={handleMapLoad}
      >
        <ZoomControl />
        <HomeControl />
        <BaseMapControl />
        <FullScreenControl />
        <LayerControl />
      </Map>
    </div>
  );
};
```

---

## 3. Ví dụ với Vanilla TypeScript (Không dùng Framework)

Nếu bạn xây dựng ứng dụng với Web Components hoặc JavaScript thuần:

```ts
import maplibregl from 'maplibre-gl';
import { 
  MapInitializer, 
  registerMapAccessor, 
  getMap 
} from '@hungpvq/map-core';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';
import '@hungpvq/map-core/style.css';

async function initVanillaMap() {
  const mapId = 'vanilla-map';
  const container = document.getElementById('map-container');

  if (!container) return;

  // 1. Kiểm tra tính tương thích WebGL
  MapInitializer.validateWebglSupport(mapId);

  // 2. Tạo cấu hình MapLibre chuẩn
  const options = MapInitializer.createDefaultOptions({
    container: container,
    style: MapInitializer.createMapStyle(),
    center: [105.85, 21.03],
    zoom: 11,
  });

  // 3. Khởi tạo instance MapLibre
  const map = new maplibregl.Map(options as any);

  // 4. Đăng ký accessor vào hệ thống Store dùng chung
  registerMapAccessor(mapId, () => map);

  map.on('load', async () => {
    console.log('MapLibre thuần đã khởi tạo xong!');

    // 5. Thêm dữ liệu GeoJSON
    const dataset = await createGeoJsonDataset({
      id: 'vanilla-geojson',
      name: 'Dữ liệu thuần',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    // Dataset có phương thức addToMap gắn trực tiếp vào MapLibre
    if (dataset && typeof (dataset as any).addToMap === 'function') {
      (dataset as any).addToMap(map);
    }
  });
}

window.addEventListener('DOMContentLoaded', initVanillaMap);
```
