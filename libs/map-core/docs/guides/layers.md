# Quản lý lớp bản đồ (Layer Management)

Trong hệ sinh thái `@hungpvq/map-dataset`, khái niệm Lớp bản đồ được nâng cấp vượt bậc so với các ID layer phẳng của MapLibre. Mỗi lớp hiển thị được quản lý trong một `DatasetLeaf` với đầy đủ khả năng kiểm soát độ mờ, hiển thị, thứ tự z-index và cây danh mục giao diện.

---

## 1. Tạo và thêm lớp bản đồ từ GeoJSON

### Thêm một lớp GeoJSON đơn lẻ (`createGeoJsonDataset`):
```ts
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';
import { useMapDataset } from '@hungpvq/vue-map-dataset'; // hoặc @hungpvq/react-map-dataset

const { addDataset } = useMapDataset('my-map-id');

const geojsonFeatureCollection: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Khu công nghiệp A', area: 150.5 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [105.80, 21.00],
            [105.85, 21.00],
            [105.85, 21.05],
            [105.80, 21.05],
            [105.80, 21.00],
          ],
        ],
      },
    },
  ],
};

const myDataset = await createGeoJsonDataset({
  id: 'industrial-zone',
  name: 'Khu công nghiệp',
  data: geojsonFeatureCollection,
  color: '#10b981', // Màu xanh lục
  opacity: 0.8,
});

// Thêm vào bản đồ và cây LayerControl
await addDataset(myDataset);
```

---

## 2. Bật / Tắt hiển thị (`toggleShow`)

Mỗi dataset cung cấp các helper tiện ích để chuyển đổi trạng thái hiển thị:

```ts
import { toggleShow } from '@hungpvq/map-dataset';

// Ẩn lớp bản đồ
toggleShow(myDataset, false);

// Hiện lại lớp bản đồ
toggleShow(myDataset, true);
```

---

## 3. Điều chỉnh độ mờ đục (`setOpacity`)

Khi bạn thay đổi độ mờ của một Dataset, hàm `setOpacity` sẽ tự động tìm kiếm tất cả các layer con (`fill`, `line`, `circle`, `symbol`, `raster`) và áp dụng đúng thuộc tính paint (`fill-opacity`, `line-opacity`, `circle-opacity`, `raster-opacity`):

```ts
import { setOpacity } from '@hungpvq/map-dataset';

// Thiết lập độ mờ về 50%
setOpacity(myDataset, 0.5);
```

---

## 4. Quản lý thứ tự hiển thị Layer (Layer Ordering & Z-Index)

Khi có nhiều layer chồng lấn lên nhau (ví dụ: layer nền đất, layer vùng nước, layer đường giao thông, layer điểm địa danh), thứ tự vẽ quyết định layer nào nằm trên.

Thư viện cung cấp bộ helper sắp xếp thứ tự:
```ts
import { 
  moveListView, 
  sortListViews, 
  syncListViewLayerOrder 
} from '@hungpvq/map-dataset';
import { getMap } from '@hungpvq/map-core';

const map = getMap('my-map-id');

// Khi người dùng kéo thả trên UI <LayerControl>:
// Di chuyển layer có id 'traffic-layer' lên trên 'landuse-layer'
moveListView(datasetStore, {
  sourceId: 'traffic-layer',
  targetId: 'landuse-layer',
  position: 'before',
});

// Đồng bộ thứ tự z-index thực tế trên canvas WebGL
syncListViewLayerOrder(map, datasetStore);
```

---

## 5. Xóa lớp bản đồ và giải phóng bộ nhớ

Khi không còn sử dụng, bạn có thể xóa dataset khỏi map:

```ts
import { useMapDataset } from '@hungpvq/vue-map-dataset';

const { removeDataset } = useMapDataset('my-map-id');

// Xóa layer và xóa source tương ứng khỏi MapLibre
removeDataset('industrial-zone');
```
