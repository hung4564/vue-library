# Hướng dẫn Khởi tạo Bản đồ (Map Initialization)

Hướng dẫn này trình bày chi tiết mọi phương thức khởi tạo bản đồ từ cấp độ thấp (Low-level Vanilla Service) đến cấp độ cao (Component-based trong Vue và React).

---

## 1. Khởi tạo qua Component `<Map>` (Khuyến nghị cho Vue & React)

Cả hai gói `@hungpvq/vue-map-core` và `@hungpvq/react-map-core` đều cung cấp component `<Map>`. Component này tự động xử lý:
* Tạo thẻ `<div>` container có resize detection.
* Khởi tạo WebGL canvas qua MapLibre.
* Đăng ký map accessor vào store hệ thống.
* Tự động giải phóng tài nguyên khi component unmount.

### Cú pháp trong Vue 3
```vue
<template>
  <div class="map-view">
    <Map
      :map-id="mapId"
      :options="mapOptions"
      :keyboard-shortcuts="true"
      @load="onMapLoad"
      @error="onMapError"
    >
      <!-- Các control lồng bên trong -->
    </Map>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { MapSimple } from '@hungpvq/map-core';
import { Map } from '@hungpvq/vue-map-core';

const mapId = 'main-gis-map';

const mapOptions = {
  center: [105.85, 21.03], // [kinh độ, vĩ độ]
  zoom: 12,
  minZoom: 3,
  maxZoom: 20,
  pitch: 0,
  bearing: 0,
};

const onMapLoad = (map: MapSimple) => {
  console.log('Map initialized successfully:', map);
};

const onMapError = (error: Error) => {
  console.error('Lỗi khởi tạo bản đồ:', error);
};
</script>

<style scoped>
.map-view {
  width: 100%;
  height: 100vh;
}
</style>
```

### Cú pháp trong React 18
```tsx
import React, { useCallback } from 'react';
import type { MapSimple } from '@hungpvq/map-core';
import { Map } from '@hungpvq/react-map-core';

export const MyMapComponent: React.FC = () => {
  const handleLoad = useCallback((map: MapSimple) => {
    console.log('React map loaded:', map.getCenter());
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Map
        mapId="react-gis-map"
        options={{
          center: [106.7, 10.8],
          zoom: 11,
        }}
        onLoad={handleLoad}
      />
    </div>
  );
};
```

---

## 2. Khởi tạo trực tiếp qua `MapInitializer` (Dành cho Vanilla JS/TS)

Lớp `MapInitializer` từ `@hungpvq/map-core` cung cấp các phương thức tĩnh độc lập framework:

```ts
import maplibregl from 'maplibre-gl';
import { 
  MapInitializer, 
  registerMapAccessor, 
  MapInitializationError 
} from '@hungpvq/map-core';

async function initRawMap(containerId: string, mapId: string) {
  // 1. Kiểm tra WebGL
  try {
    MapInitializer.validateWebglSupport(mapId);
  } catch (err) {
    if (err instanceof MapInitializationError) {
      alert('Thiết bị của bạn không hỗ trợ WebGL để xem bản đồ.');
      return;
    }
  }

  // 2. Tạo MapOptions với các giá trị mặc định tối ưu
  const container = document.getElementById(containerId);
  if (!container) return;

  const defaultOptions = MapInitializer.createDefaultOptions({
    container,
    style: MapInitializer.createMapStyle(), // Style rỗng chuẩn của MapLibre
    center: [105.85, 21.03],
    zoom: 10,
  });

  // 3. Khởi tạo MapLibre instance
  const map = new maplibregl.Map(defaultOptions as any);

  // 4. Thiết lập sự kiện qua helper
  const cleanupEvents = MapInitializer.setupMapEvents(map, {
    onLoad: (m) => {
      console.log('Map onload fired!');
    },
    onError: (err) => {
      console.error('Map error fired:', err);
    },
  });

  // 5. Đăng ký accessor để các service khác có thể truy cập qua getMap(mapId)
  registerMapAccessor(mapId, () => map);

  return { map, cleanupEvents };
}
```

---

## 3. Quản lý Đa Bản đồ (Multiple Map Instances)

Khi trang web cần hiển thị hai bản đồ (ví dụ: màn hình so sánh trước - sau hoặc bản đồ phụ xem tổng quan minimap):

1. **Đặt `mapId` khác nhau**: Mỗi thẻ `<Map>` phải có prop `map-id` duy nhất (`map-left`, `map-right`).
2. **Truy cập riêng biệt**:
   ```ts
   import { getMap } from '@hungpvq/map-core';
   
   const leftMap = getMap('map-left');
   const rightMap = getMap('map-right');
   ```
3. **Đồng bộ Camera giữa 2 bản đồ**:
   ```ts
   if (leftMap && rightMap) {
     leftMap.on('move', () => {
       rightMap.jumpTo({
         center: leftMap.getCenter(),
         zoom: leftMap.getZoom(),
         pitch: leftMap.getPitch(),
         bearing: leftMap.getBearing(),
       });
     });
   }
   ```
