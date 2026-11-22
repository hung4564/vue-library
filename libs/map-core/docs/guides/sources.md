# Quản lý nguồn dữ liệu (Source Management)

Hệ thống `@hungpvq/map-dataset` hỗ trợ đa dạng các loại nguồn dữ liệu không gian, từ dữ liệu vector GeoJSON tĩnh đến các nguồn gạch dữ liệu (Vector Tiles / Raster Tiles) quy mô hàng triệu bản ghi.

---

## 1. Phân loại nguồn dữ liệu (`source-kind`)

Hàm `getDatasetSourceKind` tự động nhận diện và phân loại nguồn dữ liệu:
* **`geojson`**: Dữ liệu vector định dạng JSON chuẩn RFC 7946. Thích hợp cho dữ liệu < 50,000 điểm hoặc dữ liệu cập nhật liên tục từ API.
* **`vector`**: Vector Tiles chuẩn Mapbox Vector Tile (`MVT` / `.pbf`). Thích hợp cho dữ liệu mạng lưới đường, thửa đất toàn quốc.
* **`raster`**: Ảnh vệ tinh hoặc bản đồ quét XYZ tile / WMTS.
* **`pmtiles`**: Định dạng đóng gói Vector/Raster tile đơn tệp hiện đại (serverless cloud storage).

---

## 2. Nguồn dữ liệu Vector Tiles (`@hungpvq/map-dataset/vector-tile`)

Vector Tiles cho phép tải và hiển thị các tập dữ liệu không gian khổng lồ bằng cách chia nhỏ thành các tile 256x256 hoặc 512x512 theo từng cấp độ zoom.

```ts
import { createVectorTileDataset } from '@hungpvq/map-dataset/vector-tile';
import { useMapDataset } from '@hungpvq/vue-map-dataset';

const { addDataset } = useMapDataset('my-map-id');

const vtDataset = await createVectorTileDataset({
  id: 'national-roads',
  name: 'Mạng lưới quốc lộ',
  url: 'https://tiles.example.com/roads/{z}/{x}/{y}.pbf',
  sourceLayer: 'transportation', // Tên layer bên trong tile PBF
  type: 'line',
  paint: {
    'line-color': '#f59e0b',
    'line-width': 2.5,
  },
  minZoom: 5,
  maxZoom: 16,
});

await addDataset(vtDataset);
```

---

## 3. Nguồn dữ liệu Raster Tiles (XYZ / WMS)

Thêm các lớp ảnh chụp, bản đồ địa hình WMS:

```ts
import { createRasterDataset } from '@hungpvq/map-dataset/raster';
import { useMapDataset } from '@hungpvq/vue-map-dataset';

const { addDataset } = useMapDataset('my-map-id');

const rasterDataset = await createRasterDataset({
  id: 'weather-radar',
  name: 'Ảnh vệ tinh mây mưa',
  tiles: [
    'https://tilecache.rainviewer.com/v2/radar/nowcast_5/{z}/{x}/{y}/256/1_1.png',
  ],
  tileSize: 256,
  opacity: 0.7,
});

await addDataset(rasterDataset);
```

---

## 4. Bounding Box & Fit Bounds (`resolveDatasetBbox`)

Mỗi khi thêm một nguồn dữ liệu mới, thông thường bạn sẽ muốn tự động căn chỉnh góc nhìn (Camera Fit Bounds) để bao trọn toàn bộ dữ liệu vừa nạp.

Thư viện cung cấp hàm tiện ích `resolveDatasetBbox`:

```ts
import { resolveDatasetBbox } from '@hungpvq/map-dataset';
import { fitBounds } from '@hungpvq/map-core';
import { getMap } from '@hungpvq/map-core';

const map = getMap('my-map-id');
if (map && myDataset) {
  // Tự động tính toán hộp bao tọa độ [minLng, minLat, maxLng, maxLat]
  const bbox = await resolveDatasetBbox(myDataset);

  if (bbox) {
    // Zoom và pan bản đồ đến vùng chứa dữ liệu kèm khoảng đệm padding 50px
    fitBounds(map, bbox, {
      padding: 50,
      duration: 1500, // Hiệu ứng lướt trong 1.5 giây
    });
  }
}
```
