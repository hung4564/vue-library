# Tích hợp với Vue 3 (Vue 3 Integration)

Adapter `@hungpvq/vue-map-*` được thiết kế tối ưu riêng cho **Vue 3 Composition API**, tận dụng hệ thống reactivity của Vue mà vẫn giữ cho WebGL instance hoạt động ở hiệu năng cao nhất.

---

## 1. Bootstrap plugin trong `main.ts`

Hàm `installMapApp(app)` đăng ký các plugin cần thiết:

```ts
import { createApp } from 'vue';
import { installMapApp } from '@hungpvq/vue-map';
import '@hungpvq/vue-map/style.css';
import App from './App.vue';

const app = createApp(App);
installMapApp(app);
app.mount('#app');
```

---

## 2. Các Composables chính

### 1. `useMap(mapId)`
Composable chính để tương tác với map instance:

```ts
import { useMap } from '@hungpvq/vue-map-core';

const { map, isLoaded, setCenter, setZoom } = useMap('my-map-id');

// map là một shallowRef<MapSimple | undefined>
// isLoaded là một ref<boolean>
```

---

### 2. `useMapDataset(mapId)`
Composable quản lý danh sách dataset và layer:

```ts
import { useMapDataset } from '@hungpvq/vue-map-dataset';

const { 
  datasets,      // Computed danh sách dataset
  addDataset,    // Hàm thêm dataset
  removeDataset, // Hàm xóa dataset
  clearDatasets  // Xóa toàn bộ
} = useMapDataset('my-map-id');
```

---

### 3. `useMapState(mapId)`
Theo dõi trạng thái thời gian thực của camera bản đồ (zoom level, center coordinates, pitch, bearing):

```ts
import { useMapState } from '@hungpvq/vue-map-core';

const { zoom, center, bearing } = useMapState('my-map-id');
```

---

## 3. Cấu trúc Component đầy đủ (Vue 3 SFC)

```vue
<template>
  <div class="map-container">
    <Map :map-id="mapId" :options="initialOptions" @load="onMapReady">
      <!-- 1. Thanh công cụ góc trên phải -->
      <ZoomControl position="top-right" />
      <HomeControl position="top-right" />
      <FullScreenControl position="top-right" />
      <BaseMapControl position="top-right" />

      <!-- 2. Quản lý danh mục Layer bên trái -->
      <LayerControl position="top-left" />

      <!-- 3. Tra cứu thông tin click -->
      <IdentifyControl />

      <!-- 4. Hiển thị tọa độ góc dưới trái -->
      <MouseCoordinatesControl position="bottom-left" />
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
  FullScreenControl,
  BaseMapControl,
  MouseCoordinatesControl
} from '@hungpvq/vue-map-core';
import { 
  LayerControl, 
  IdentifyControl, 
  useMapDataset 
} from '@hungpvq/vue-map-dataset';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';

const mapId = 'enterprise-map';

const initialOptions = {
  center: [105.85, 21.03],
  zoom: 12,
};

const { addDataset } = useMapDataset(mapId);

const onMapReady = async (map: MapSimple) => {
  console.log('Map Vue đã sẵn sàng!');
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>
```

---

## 4. Những điều cần tránh trong Vue 3

> [!WARNING]
> * **TUYỆT ĐỐI KHÔNG** dùng `reactive({ map: mapInstance })`: Proxy của Vue sẽ can thiệp vào các thuộc tính private của MapLibre và gây lỗi `TypeError: Cannot read private member`. Luôn dùng `shallowRef` nếu bạn cần lưu instance trong Vue state.
