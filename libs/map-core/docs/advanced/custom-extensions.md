# Phát triển tiện ích mở rộng & Plugin (Custom Extensions)

Kiến trúc của `@hungpvq/map-core` được thiết kế theo hướng mở (Open-Closed Principle). Bạn có thể mở rộng hầu hết các tính năng thông qua **Universal Registry** mà không cần phải can thiệp vào mã nguồn gốc của thư viện.

---

## 1. Mở rộng nút bấm công cụ (Custom Control Extension)

Để thêm một công cụ mới vào thanh `ToolbarControl`:

```ts
import { UniversalRegistry, buildMapControlHandle } from '@hungpvq/map-core';

// 1. Tạo control handle
export const exportKmlControl = buildMapControlHandle({
  id: 'export-kml-action',
  title: 'Xuất file KML',
  icon: 'mdi-file-export',
  action: (map) => {
    console.log('Đang thực hiện xuất KML từ map:', map);
  },
});

// 2. Đăng ký vào namespace 'control'
UniversalRegistry.register('control', 'export-kml-action', exportKmlControl);
```

---

## 2. Mở rộng Menu ngữ cảnh của Layer (Custom Layer Menu)

Khi người dùng mở danh sách layer trong `<LayerControl>`, mỗi layer có một nút menu (ba chấm `...`) để thực hiện các hành động như Xóa layer, Đổi tên, Đổi độ mờ.

Bạn có thể đăng ký thêm hành động vào menu này:

```ts
import { UniversalRegistry } from '@hungpvq/map-core';

UniversalRegistry.register('menu', 'custom-layer-stats', {
  id: 'custom-layer-stats',
  label: 'Thống kê số lượng đối tượng',
  icon: 'mdi-chart-bar',
  run: (dataset, map) => {
    alert(`Layer "${dataset.name}" đang hiển thị.`);
  },
});
```

---

## 3. Đăng ký bộ chuyển đổi định dạng mới (Custom Format Parser)

Nếu hệ thống của bạn có định dạng file nội bộ riêng (ví dụ mã hóa nhị phân riêng):

```ts
import { UniversalRegistry } from '@hungpvq/map-core';

UniversalRegistry.register('format', 'custom-binary', {
  extension: '.bin',
  parse: async (arrayBuffer) => {
    // Giải mã nhị phân thành GeoJSON
    return {
      type: 'FeatureCollection',
      features: [],
    };
  },
});
```
