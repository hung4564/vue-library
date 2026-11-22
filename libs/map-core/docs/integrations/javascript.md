# Tích hợp với JavaScript thuần (Vanilla JS)

Thư viện `@hungpvq/map-core` và `@hungpvq/map-dataset` được thiết kế độc lập framework, cho phép tích hợp mượt mà vào bất kỳ ứng dụng web truyền thống nào (HTML + script tags, jQuery, hoặc Web Components).

---

## 1. Cài đặt và Bundler Setup

Nếu bạn sử dụng Webpack, Rollup hoặc Vite cho dự án JavaScript thuần (ES6+):

```bash
npm install @hungpvq/map-core @hungpvq/map-dataset maplibre-gl
```

---

## 2. Mã nguồn ví dụ hoàn chỉnh

Tạo tệp `app.js`:

```js
import maplibregl from 'maplibre-gl';
import { 
  MapInitializer, 
  registerMapAccessor, 
  getMap 
} from '@hungpvq/map-core';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';
import '@hungpvq/map-core/style.css';

const MAP_ID = 'vanilla-app-map';

async function bootstrap() {
  const container = document.getElementById('map');
  if (!container) return;

  // 1. Kiểm tra WebGL
  if (!MapInitializer.isWebglSupported()) {
    container.innerHTML = '<div class="alert">Trình duyệt không hỗ trợ WebGL.</div>';
    return;
  }

  // 2. Khởi tạo MapLibre instance
  const options = MapInitializer.createDefaultOptions({
    container: container,
    style: MapInitializer.createMapStyle(),
    center: [105.85, 21.03],
    zoom: 12,
  });

  const map = new maplibregl.Map(options);

  // 3. Đăng ký Accessor
  registerMapAccessor(MAP_ID, () => map);

  // 4. Lắng nghe khi tải xong
  map.on('load', async () => {
    console.log('MapLibre sẵn sàng!');

    // 5. Thêm dữ liệu GeoJSON
    const dataset = await createGeoJsonDataset({
      id: 'point-demo',
      name: 'Điểm mẫu',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [105.85, 21.03] },
            properties: { title: 'Hà Nội' },
          },
        ],
      },
      color: '#3b82f6',
    });

    if (dataset && typeof dataset.addToMap === 'function') {
      dataset.addToMap(map);
    }
  });
}

window.addEventListener('DOMContentLoaded', bootstrap);
```
