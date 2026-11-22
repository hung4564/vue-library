# Ví dụ: Khởi tạo bản đồ cơ bản (Basic Map)

Ví dụ này trình bày một ứng dụng Vue 3 / React hoàn chỉnh hiển thị bản đồ với các nút điều khiển góc nhìn và lớp nền mặc định.

---

## 1. Yêu cầu nghiệp vụ
* Hiển thị bản đồ trung tâm tại Hà Nội, Việt Nam.
* Cung cấp các nút: Phóng to/thu nhỏ, Quay về điểm gốc (Home), Đổi lớp nền (OSM/Vệ tinh/Nền tối), Phóng to toàn màn hình.
* Hiển thị tọa độ con trỏ chuột thời gian thực ở góc dưới.

---

## 2. Mã nguồn hoàn chỉnh (Vue 3)

```vue
<template>
  <div class="map-page">
    <Map
      :map-id="mapId"
      :options="mapOptions"
      @load="handleMapLoaded"
    >
      <!-- Nhóm công cụ góc trên phải -->
      <ZoomControl position="top-right" />
      <HomeControl position="top-right" />
      <FullScreenControl position="top-right" />
      <BaseMapControl position="top-right" />

      <!-- Thanh tọa độ góc dưới trái -->
      <MouseCoordinatesControl position="bottom-left" />
    </Map>
  </div>
</template>

<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { 
  Map, 
  ZoomControl, 
  HomeControl, 
  FullScreenControl,
  BaseMapControl,
  MouseCoordinatesControl
} from '@hungpvq/vue-map-core';

const mapId = 'basic-demo-map';

const mapOptions = {
  center: [105.854444, 21.028511],
  zoom: 12,
  minZoom: 4,
  maxZoom: 19,
};

const handleMapLoaded = (map: MapSimple) => {
  console.log('Bản đồ cơ bản đã sẵn sàng!', map.getCenter());
};
</script>

<style scoped>
.map-page {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
```

---

## 3. Giải thích chi tiết

1. Component `<Map>` tự động khởi tạo MapLibre và lắng nghe sự thay đổi kích thước của thẻ `.map-page`.
2. Thuộc tính `position="top-right"` tự động xếp chồng các nút `ZoomControl`, `HomeControl`, `FullScreenControl` và `BaseMapControl` thành một thanh công cụ thanh lịch.
3. Khi người dùng click chọn bản đồ nền vệ tinh trong `BaseMapControl`, hệ thống tự động thay đổi lớp nền mà không ảnh hưởng đến vị trí camera hay góc zoom hiện tại.
