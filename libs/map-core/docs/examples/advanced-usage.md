# Ví dụ: Sử dụng nâng cao (Advanced Usage)

Ví dụ này trình bày các kịch bản chuyên sâu: Tích hợp công cụ vẽ đa giác (`@hungpvq/map-draw`), lấy tọa độ đã vẽ, tính toán diện tích bằng Turf và xuất dữ liệu ra file.

---

## 1. Kịch bản nghiệp vụ: Số hóa khu vực bảo vệ (Digitizing Area)
1. Người dùng bấm nút "Bắt đầu vẽ vùng".
2. Con trỏ chuột chuyển sang chế độ vẽ đa giác của `DrawService`.
3. Khi vẽ xong (click đúp điểm cuối):
   - Tính toán diện tích theo mét vuông (m²).
   - Hiển thị thông báo kết quả.
   - Cho phép xuất kết quả ra file GeoJSON.

---

## 2. Mã nguồn hoàn chỉnh (TypeScript / Vue 3)

```vue
<template>
  <div class="map-view">
    <Map :map-id="mapId" :options="mapOptions" @load="initDrawTools">
      <ZoomControl position="top-right" />
      <BaseMapControl position="top-right" />

      <!-- Thanh công cụ tùy chỉnh phía trên -->
      <div class="custom-toolbar">
        <button class="btn" @click="startDrawing">✏️ Vẽ vùng quy hoạch</button>
        <button class="btn btn-danger" @click="clearDrawings">🗑️ Xóa hình vẽ</button>
      </div>
    </Map>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { MapSimple } from '@hungpvq/map-core';
import { Map, ZoomControl, BaseMapControl } from '@hungpvq/vue-map-core';
import { DrawService, DrawingType } from '@hungpvq/map-draw';
import area from '@turf/area';

const mapId = 'advanced-draw-map';
let drawService: DrawService | null = null;

const mapOptions = {
  center: [105.85, 21.03],
  zoom: 12,
};

const initDrawTools = (map: MapSimple) => {
  // Khởi tạo DrawService gắn vào MapLibre
  drawService = new DrawService(map);
};

const startDrawing = () => {
  if (!drawService) return;

  drawService.startDraw(DrawingType.POLYGON, (feature) => {
    // 1. Tính toán diện tích bằng Turf.js
    const areaSqMeters = area(feature);
    const areaHectares = (areaSqMeters / 10000).toFixed(2);

    alert(`Vẽ thành công! Diện tích khu vực: ${areaSqMeters.toFixed(1)} m² (${areaHectares} ha)`);
  });
};

const clearDrawings = () => {
  drawService?.deleteAll();
};
</script>

<style scoped>
.custom-toolbar {
  position: absolute;
  top: 16px;
  left: 60px;
  z-index: 10;
  display: flex;
  gap: 8px;
}
.btn {
  background: white;
  border: 1px solid #cbd5e1;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.btn:hover {
  background: #f8fafc;
}
.btn-danger {
  color: #ef4444;
}
</style>
```
