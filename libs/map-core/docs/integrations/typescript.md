# Tích hợp với TypeScript (TypeScript Integration)

Toàn bộ các gói `@hungpvq/map-*` được viết 100% bằng TypeScript với độ bao phủ kiểu dữ liệu nghiêm ngặt (`strict: true`), cung cấp đầy đủ `.d.ts` đi kèm mà không cần cài đặt thêm `@types/*` riêng lẻ.

---

## 1. Các kiểu dữ liệu quan trọng

### 1. `MapSimple`
Là kiểu đại diện cho Map instance. Cung cấp các phương thức cốt lõi của MapLibre GL (`on`, `off`, `getCenter`, `setCenter`, `getZoom`, `setZoom`, `addLayer`, `addSource`, `removeLayer`, `removeSource`...).

```ts
import type { MapSimple } from '@hungpvq/map-core';

function logMapCenter(map: MapSimple) {
  const center = map.getCenter();
  console.log(`Lng: ${center.lng}, Lat: ${center.lat}`);
}
```

---

### 2. `IDataset`, `DatasetLeaf`, `DatasetComposite`
Mô tả giao diện dữ liệu của cây layer:

```ts
import type { IDataset } from '@hungpvq/map-dataset';
import { isComposite } from '@hungpvq/map-dataset';

function inspectDataset(ds: IDataset) {
  console.log(`Dataset ID: ${ds.id}, Name: ${ds.name}`);
  if (isComposite(ds)) {
    console.log(`Số layer con: ${ds.children.length}`);
  }
}
```

---

### 3. Tương thích với kiểu GeoJSON chuẩn
Các hàm nạp dữ liệu nhận trực tiếp kiểu `FeatureCollection`, `Feature`, `Geometry` từ gói chuẩn `@types/geojson`:

```ts
import type { FeatureCollection, Point } from 'geojson';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';

const myPoints: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [105.8, 21.0] },
      properties: { id: 1, name: 'Trạm đo' },
    },
  ],
};

const dataset = await createGeoJsonDataset({
  id: 'sensor-stations',
  name: 'Trạm quan trắc',
  data: myPoints,
});
```

---

## 2. Generic Events & Type Safety

Sự kiện `MAP_CORE_EVENT` và các sự kiện con đều được gán kiểu định danh mạnh, giúp trình biên dịch TypeScript phát hiện sớm lỗi sai chính tả trong tên sự kiện hoặc tham số callback.
