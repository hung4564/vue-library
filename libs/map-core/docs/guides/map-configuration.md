# Cấu hình bản đồ (Map Configuration)

Tài liệu này giải thích chi tiết các tham số cấu hình hiển thị bản đồ, bao gồm style nền, font chữ (glyphs), biểu tượng (sprites) và hệ quy chiếu không gian (projection).

---

## 1. Cấu hình Style cơ sở (`MapOptions['style']`)

Bản đồ MapLibre yêu cầu một đối tượng Map Style theo chuẩn MapLibre/Mapbox Style Specification v8. Thư viện cung cấp hàm tạo sẵn `MapInitializer.createMapStyle(customStyle)`.

### Cấu trúc mặc định của Style:
```json
{
  "version": 8,
  "metadata": {},
  "sources": {},
  "layers": [],
  "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  "sprite": undefined
}
```

### Sử dụng Style trực tuyến hoặc Custom JSON:
```ts
// 1. Dùng URL style trực tuyến (OSM, Maptiler, Carto)
const onlineStyle = 'https://demotiles.maplibre.org/style.json';

// 2. Dùng cấu hình tùy biến với font glyphs tự host (on-premise)
import { MapInitializer } from '@hungpvq/map-core';

const customStyle = MapInitializer.createMapStyle({
  glyphs: 'https://my-domain.com/fonts/{fontstack}/{range}.pbf',
  sprite: 'https://my-domain.com/sprites/sprite',
});
```

---

## 2. Quản lý Lớp Bản đồ Nền (`@hungpvq/map-core/basemap`)

Thư viện tích hợp sẵn dịch vụ quản lý bản đồ nền `BasemapService`, hỗ trợ sẵn các nhà cung cấp phổ biến qua hằng số `INIT_BASEMAPS`:

| ID Nền | Loại | Nhà cung cấp | Mô tả |
| :--- | :--- | :--- | :--- |
| `osm` | Raster | OpenStreetMap | Bản đồ đường phố tiêu chuẩn thế giới |
| `arcgis-satellite` | Raster | ESRI / ArcGIS | Ảnh vệ tinh độ phân giải cao |
| `carto-dark` | Raster | CartoDB | Bản đồ nền tối hiện đại |
| `google-satellite` | Raster | Google Maps | Ảnh chụp vệ tinh |
| `none` | Trống | — | Nền rỗng, phục vụ hiển thị layer chuyên đề |

### Đổi bản đồ nền bằng mã lập trình:
```ts
import { BasemapService } from '@hungpvq/map-core/basemap';
import { getMap } from '@hungpvq/map-core';

const map = getMap('my-map-id');
if (map) {
  // Chuyển sang nền vệ tinh ArcGIS
  BasemapService.setBasemap(map, 'arcgis-satellite');
  
  // Tùy chỉnh độ mờ của lớp nền (ví dụ làm mờ 50% để nổi bật dữ liệu quy hoạch)
  BasemapService.setOpacity(map, 0.5);
}
```

---

## 3. Cấu hình Quả cầu 3D (Globe Projection)

Thư viện hỗ trợ chuyển đổi giữa chế độ phẳng (Mercator) và chế độ quả địa cầu 3D (Globe Projection) của MapLibre v5:

```ts
import { 
  toggleGlobeProjection, 
  isGlobeProjection, 
  attachGlobeProjectionListener 
} from '@hungpvq/map-core';
import { getMap } from '@hungpvq/map-core';

const map = getMap('my-map-id');
if (map) {
  // Kiểm tra xem có đang ở chế độ quả cầu không
  const isGlobe = isGlobeProjection(map);

  // Chuyển đổi qua lại giữa Flat và Globe
  toggleGlobeProjection(map);
}
```

---

## 4. Quản lý Tọa độ & Điều hướng góc nhìn (`Goto` & `Home`)

### Lưu và quay về điểm ban đầu (Home View):
```ts
import { captureHomeView, goHome } from '@hungpvq/map-core';

const map = getMap('my-map-id');
if (map) {
  // Ghi nhớ vị trí hiện tại làm vị trí gốc
  const home = captureHomeView(map);

  // Quay trở về vị trí gốc với animation mượt
  goHome(map, home);
}
```

### Di chuyển nhanh đến tọa độ bất kỳ (Goto):
```ts
import { applyGotoSetting } from '@hungpvq/map-core';

const map = getMap('my-map-id');
if (map) {
  applyGotoSetting(map, {
    coordinates: [105.85, 21.03],
    zoom: 15,
    pitch: 45,
    bearing: 90,
    animate: true,
  });
}
```
