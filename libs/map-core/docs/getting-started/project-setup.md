# Thiết lập dự án (Project Setup)

Tài liệu này hướng dẫn chi tiết cách cấu hình một dự án mới từ đầu (sử dụng Vite làm build tool) để tích hợp bộ thư viện bản đồ `@hungpvq/map-*` một cách tối ưu nhất.

---

## 1. Khởi tạo dự án với Vite

Bạn có thể chọn template Vue TypeScript hoặc React TypeScript:

```bash
# Tạo dự án với Vue 3 + TypeScript
npm create vite@latest my-map-app -- --template vue-ts

# Hoặc tạo dự án với React 18 + TypeScript
npm create vite@latest my-map-app -- --template react-ts

cd my-map-app
npm install
```

---

## 2. Cài đặt các gói phụ thuộc

Cài đặt meta-package và các peer dependencies:

```bash
# Nếu dùng Vue:
npm install @hungpvq/vue-map maplibre-gl

# Nếu dùng React:
npm install @hungpvq/react-map maplibre-gl
```

---

## 3. Cấu hình Vite (`vite.config.ts`)

Khi sử dụng MapLibre GL và các tính năng Web Worker GIS (phân tích file nặng trong background), bạn nên cấu hình `vite.config.ts` như sau:

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'; // hoặc @vitejs/plugin-react nếu dùng React

export default defineConfig({
  plugins: [vue()],
  worker: {
    format: 'es', // Đảm bảo Web Worker được đóng gói chuẩn ESM
  },
  optimizeDeps: {
    include: ['maplibre-gl'],
  },
  server: {
    port: 5173,
    open: true,
  },
});
```

> **Lưu ý về GIS Worker (`@hungpvq/map-dataset/vite`)**:  
> Nếu bạn dự định sử dụng tính năng nạp và giải mã file bản đồ lớn (KML, Shapefile, GeoPackage, file GeoJSON hàng chục MB) bằng Web Worker, package `@hungpvq/map-dataset` cung cấp một Vite plugin tích hợp sẵn:
> ```ts
> import { mapDatasetGisWorker } from '@hungpvq/map-dataset/vite';
> // Thêm vào mảng plugins:
> plugins: [vue(), mapDatasetGisWorker()]
> ```

---

## 4. Thiết lập CSS và Thẻ Container

### Thiết lập thẻ gốc trong `index.html` hoặc `App.vue`
Bản đồ WebGL cần một thẻ chứa có kích thước chiều rộng và chiều cao rõ ràng (`width` & `height` phải lớn hơn 0). Nếu chiều cao là `0px`, canvas MapLibre sẽ không thể render hoặc gặp lỗi WebGL viewport.

Trong `src/style.css`:
```css
html,
body,
#app,
#root {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Đảm bảo khung chứa map chiếm toàn bộ không gian mong muốn */
.map-full-container {
  width: 100%;
  height: 100%;
  position: relative;
}
```

---

## 5. Cấu hình Ngôn ngữ và Giao diện (Theme & Locale)

Thư viện hỗ trợ sẵn 2 ngôn ngữ: Tiếng Anh (`en`) và Tiếng Việt (`vi`).

### Thay đổi ngôn ngữ mặc định:
```ts
import { bootstrapMapLanguage } from '@hungpvq/map-core';

// Chuyển toàn bộ nhãn control sang tiếng Việt
bootstrapMapLanguage('vi');
```

### Thay đổi Theme (Giao diện sáng / tối / chuyên biệt):
```ts
import { bootstrapMapTheme } from '@hungpvq/map-core/theme';

// Các tùy chọn: 'auto' | 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'slate'
bootstrapMapTheme('dark');
```

---

## 6. Phím tắt toàn cục tích hợp sẵn

Khi sử dụng component `<Map>` với thuộc tính mặc định `keyboardShortcuts: true`:
* **Phím `/`**: Tự động mở bảng `LayerControl` và focus vào ô tìm kiếm lớp bản đồ.
* **Phím `Esc`**: Đóng panel control đang mở trên cùng.

Nếu muốn tắt phím tắt này trong component:
```vue
<!-- Vue -->
<Map :map-id="mapId" :keyboard-shortcuts="false" />
```
```tsx
// React
<Map mapId={mapId} keyboardShortcuts={false} />
```
