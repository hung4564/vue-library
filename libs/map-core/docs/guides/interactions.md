# Hệ thống tương tác (Interactions)

Tài liệu này hướng dẫn cách xây dựng các trải nghiệm tương tác phong phú trên bản đồ: bắt sự kiện click/hover trên đối tượng, hiển thị popup tra cứu thuộc tính (Identify), và đo đạc kích thước không gian.

---

## 1. Tương tác trỏ chuột & Tra cứu đối tượng (Feature Hit Detection)

Để nhận diện đối tượng khi người dùng click hoặc rê chuột qua, sử dụng API `queryRenderedFeatures` của MapLibre kết hợp với sự kiện:

```ts
import { subscribeMapReady } from '@hungpvq/map-core';

subscribeMapReady('my-map-id', (map) => {
  // 1. Đổi con trỏ chuột khi rê qua đối tượng thuộc layer 'industrial-zone'
  map.on('mouseenter', 'industrial-zone', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'industrial-zone', () => {
    map.getCanvas().style.cursor = '';
  });

  // 2. Click vào đối tượng để lấy thông tin properties
  map.on('click', 'industrial-zone', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['industrial-zone'],
    });

    if (features.length > 0) {
      const topFeature = features[0];
      console.log('Thuộc tính đối tượng được chọn:', topFeature.properties);
    }
  });
});
```

---

## 2. Sử dụng tính năng Identify có sẵn (`<IdentifyControl />`)

Component `<IdentifyControl />` từ `@hungpvq/vue-map-dataset` hoặc `@hungpvq/react-map-dataset` tự động hóa toàn bộ quy trình trên:
* Khi người dùng nhấp vào bất kỳ điểm nào trên bản đồ, component sẽ tự động quét các layer đang bật.
* Nếu có đối tượng, một popup đẹp mắt hiển thị bảng thuộc tính dạng key-value.
* Hỗ trợ ghim (pin) popup và phóng to (zoom to) đối tượng được chọn.

```vue
<!-- Vue -->
<template>
  <Map :map-id="mapId">
    <!-- Bật tính năng tra cứu thuộc tính -->
    <IdentifyControl />
  </Map>
</template>
```

---

## 3. Công cụ đo đạc không gian (`<MeasurementControl />`)

Tích hợp công cụ đo khoảng cách và diện tích:
* **Đo khoảng cách (Line measurement)**: Người dùng click các điểm trên bản đồ để tạo đường dẫn, hệ thống tính toán chiều dài (mét / kilômét) theo giải thuật trắc địa Great-circle của Turf.js.
* **Đo diện tích (Area measurement)**: Người dùng vẽ một đa giác khép kín, hệ thống tự động tính diện tích (m² / hecta / km²).

```vue
<!-- Vue -->
<template>
  <Map :map-id="mapId">
    <MeasurementControl />
  </Map>
</template>
```

---

## 4. Công cụ vẽ & chỉnh sửa hình học (`@hungpvq/map-draw`)

Để cho phép người dùng số hóa dữ liệu (vẽ mới hoặc sửa đổi đỉnh hình học):

```ts
import { DrawService, DrawingType } from '@hungpvq/map-draw';
import { getMap } from '@hungpvq/map-core';

const map = getMap('my-map-id');
if (map) {
  // Khởi tạo DrawService gắn vào map instance
  const drawService = new DrawService(map);

  // Kích hoạt chế độ vẽ đa giác
  drawService.startDraw(DrawingType.POLYGON, (createdFeature) => {
    console.log('Người dùng vừa vẽ xong đa giác:', createdFeature);
  });
}
```
