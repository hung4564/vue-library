# Hướng dẫn cài đặt (Installation Guide)

Tài liệu này cung cấp các phương pháp cài đặt chi tiết bộ thư viện bản đồ cho dự án của bạn, bao gồm cả cách sử dụng Meta Package tiện lợi và cài đặt từng phần (A-la-carte).

---

## 1. Yêu cầu môi trường (Prerequisites)

* **Node.js**: Phiên bản `>= 18.0.0` (khuyến nghị Node 20 LTS).
* **Package Manager**: `npm` (>= 9), `pnpm` (>= 8), hoặc `yarn` (>= 1.22).
* **Trình duyệt mục tiêu**: Hỗ trợ WebGL 1.0 / WebGL 2.0 (Chrome, Firefox, Safari, Edge phiên bản hiện đại).

---

## 2. Cách 1: Sử dụng Meta Package (Khuyến nghị)

Meta package gộp sẵn toàn bộ các thành phần (Core, Dataset, Draw, UI Controls) và style CSS trong 1 gói cài đặt duy nhất.

### Dành cho dự án Vue 3

```bash
# Sử dụng npm
npm install @hungpvq/vue-map maplibre-gl vue

# Sử dụng pnpm
pnpm add @hungpvq/vue-map maplibre-gl vue

# Sử dụng yarn
yarn add @hungpvq/vue-map maplibre-gl vue
```

### Dành cho dự án React 18

```bash
# Sử dụng npm
npm install @hungpvq/react-map maplibre-gl react react-dom

# Sử dụng pnpm
pnpm add @hungpvq/react-map maplibre-gl react react-dom

# Sử dụng yarn
yarn add @hungpvq/react-map maplibre-gl react react-dom
```

---

## 3. Cách 2: Cài đặt từng gói độc lập (A-la-carte)

Nếu ứng dụng của bạn chỉ cần các tính năng tối giản (ví dụ: chỉ cần hiển thị bản đồ nền cơ bản mà không cần công cụ vẽ hay cây danh mục layer), bạn có thể cài đặt chọn lọc:

### Chỉ cài đặt Core bản đồ (Tối giản nhất)
```bash
# Vue 3
npm install @hungpvq/map-core @hungpvq/vue-map-core maplibre-gl vue

# React 18
npm install @hungpvq/map-core @hungpvq/react-map-core maplibre-gl react react-dom
```

### Bổ sung thêm tính năng quản lý Layer & Dữ liệu không gian (Dataset)
```bash
# Vue 3
npm install @hungpvq/map-dataset @hungpvq/vue-map-dataset @hungpvq/vue-draggable

# React 18
npm install @hungpvq/map-dataset @hungpvq/react-map-dataset @hungpvq/react-draggable
```

### Bổ sung thêm công cụ vẽ hình không gian (Draw Tools)
```bash
# Vue 3
npm install @hungpvq/map-draw @hungpvq/vue-map-draw

# React 18
npm install @hungpvq/map-draw @hungpvq/react-map-draw
```

---

## 4. Bắt buộc: Cấu hình CSS Stylesheet

Thư viện tách riêng logic JavaScript và giao diện CSS để tối ưu tree-shaking. Bạn **bắt buộc** phải import file CSS tại điểm khởi đầu của ứng dụng (ví dụ: `main.ts` hoặc `index.tsx`), nếu không các control và giao diện popup sẽ bị vỡ layout:

### Khi dùng Meta Package
```ts
// Vue (tại main.ts)
import '@hungpvq/vue-map/style.css';

// React (tại main.tsx hoặc App.tsx)
import '@hungpvq/react-map/style.css';
```

### Khi dùng từng gói riêng lẻ (A-la-carte)
```ts
// Đảm bảo nạp đầy đủ các stylesheet tương ứng:
import '@hungpvq/map-core/style.css';
import '@hungpvq/map-dataset/style.css';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
import '@hungpvq/vue-draggable/style.css'; // Cần thiết cho LayerControl kéo thả
// Nếu có dùng vẽ:
import '@hungpvq/vue-map-draw/style.css';
```

---

## 5. Peer Dependencies và Optional Peers

Các package trong hệ thống yêu cầu một số thư viện ngang hàng (peer dependencies):

| Dependency | Phiên bản | Bắt buộc? | Mô tả công dụng |
| :--- | :--- | :--- | :--- |
| `maplibre-gl` | `^5.4.0` | **Bắt buộc** | Engine WebGL render vector tile và raster |
| `@hungpvq/shared` | `^0.4.0` | Tự động kèm | Các tiện ích chia sẻ dùng chung |
| `@hungpvq/shared-store` | `^0.3.1` | Tự động kèm | Quản lý state reactive phân tầng |
| `file-saver` | `^2.0.5` | *Tùy chọn* | Cần khi dùng tính năng xuất file GeoJSON/Ảnh bản đồ |
| `@maplibre/maplibre-gl-style-spec` | `^23.2.1` | *Tùy chọn* | Cần khi thực hiện validate Map Style phức tạp |

---

## 6. Cấu hình TypeScript (`tsconfig.json`)

Đảm bảo cấu hình TypeScript của bạn hỗ trợ module resolution hiện đại:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler", // hoặc "node"
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```
