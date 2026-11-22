# Tra cứu API: Types & Enums (Kiểu & Hằng số)

Danh sách các kiểu dữ liệu nâng cao, kiểu Union và Enums định nghĩa trong mã nguồn.

---

## 1. `DrawingType` (`@hungpvq/map-draw`)

Các chế độ vẽ hình học không gian được hỗ trợ:

```ts
export const DrawingType = {
  POINT: 'draw_point',
  LINE_STRING: 'draw_line_string',
  POLYGON: 'draw_polygon',
  CIRCLE: 'draw_circle',
  RECTANGLE: 'draw_rectangle',
  STATIC: 'static',
} as const;

export type DrawingType = (typeof DrawingType)[keyof typeof DrawingType];
```

---

## 2. `MapThemeId` & `MapThemeMode` (`@hungpvq/map-core/theme`)

Danh sách các theme màu giao diện được định nghĩa sẵn:

```ts
export const MAP_THEME_IDS = [
  'light',    // Giao diện sáng thanh lịch
  'dark',     // Giao diện tối chuyên nghiệp
  'vibrant',  // Giao diện màu sắc nổi bật
  'ocean',    // Giao diện sắc thái biển xanh
  'forest',   // Giao diện sắc thái rừng xanh
  'sunset',   // Giao diện hoàng hôn ấm áp
  'slate',    // Giao diện màu xám đá hiện đại
] as const;

export type MapThemeId = (typeof MAP_THEME_IDS)[number];

/** Chế độ lựa chọn theme: 'auto' (theo hệ điều hành) hoặc theme chỉ định */
export type MapThemeMode = 'auto' | MapThemeId;
```

---

## 3. `MapPlatformHostId` (`@hungpvq/map-core`)

Định danh các adapter framework kết nối vào tầng platform:

```ts
export const MAP_PLATFORM_HOST = {
  DEFAULT: 'default',
  VUE_MAP_CORE: 'vue-map-core',
  REACT_MAP_CORE: 'react-map-core',
} as const;

export type MapPlatformHostId =
  | (typeof MAP_PLATFORM_HOST)[keyof typeof MAP_PLATFORM_HOST]
  | (string & NonNullable<unknown>);
```

---

## 4. `MapControlPanelPosition` (`@hungpvq/map-core`)

Vị trí neo của các panel và popup điều khiển:

```ts
export type MapControlPanelPosition = 
  | 'top-left' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-right';
```

---

## 5. `ComponentType` (`@hungpvq/map-dataset`)

Phân loại các thành phần chức năng bên trong một Dataset:

```ts
export type ComponentType = 
  | 'source'      // Nguồn dữ liệu (GeoJSON, Vector, Raster)
  | 'layer'       // Lớp hiển thị MapLibre
  | 'metadata'    // Thông tin mô tả
  | 'bound'       // Bounding box dữ liệu
  | 'list-view';  // Cấu hình giao diện trên LayerControl
```
