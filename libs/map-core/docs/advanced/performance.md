# Tối ưu hóa hiệu năng (Performance Optimization)

Tài liệu này tổng hợp các chiến lược tối ưu hóa để đảm bảo ứng dụng Web GIS xử lý mượt mà lượng dữ liệu không gian lớn (hàng trăm nghìn điểm/đa giác) mà không bị sụt giảm fps.

---

## 1. Sử dụng Vector Tiles thay cho GeoJSON với tập dữ liệu lớn

| Tiêu chí | GeoJSON | Vector Tiles (MVT / PMTiles) |
| :--- | :--- | :--- |
| **Dung lượng nạp** | Tải toàn bộ file một lần (ví dụ: 50MB) | Chỉ tải các tile trong khung nhìn (Viewport) |
| **Xử lý CPU** | Main thread phải parse JSON text nặng | Tile dạng nhị phân protobuf (PBF) nạp cực nhanh |
| **Giới hạn khuyến nghị**| < 50,000 features | Không giới hạn (hàng triệu features) |

> **Quy tắc vàng**: Nếu tập dữ liệu của bạn vượt quá 5MB hoặc 20,000 đối tượng, hãy chuyển đổi sang Vector Tiles (`@hungpvq/map-dataset/vector-tile`).

---

## 2. Tách tác vụ tính toán sang Web Worker

Khi xử lý các file KML, Shapefile, tính toán buffer hoặc chuyển đổi hệ tọa độ VN-2000 qua WGS84, Main Thread sẽ bị nghẽn (UI freeze).

Sử dụng GIS Worker tích hợp sẵn trong `@hungpvq/map-dataset/geojson`:
```ts
import { loadGeojsonFileAsync, configureGisWorker } from '@hungpvq/map-dataset/geojson';

// Tự động phân tích file nặng trong background thread
const geojsonData = await loadGeojsonFileAsync(largeShapefileZip);
```

---

## 3. Tối ưu hóa Layer Styling & Paint Properties

1. **Tránh đổi Paint properties liên tục từng frame**:
   Thay vì dùng vòng lặp `setInterval` để đổi màu, hãy sử dụng Feature State (`map.setFeatureState`) hoặc Data-driven styling (`['case', ...]`).
2. **Sử dụng Simplified Geometries ở các mức zoom nhỏ**:
   Dùng hàm `simplify` của Turf để giảm số lượng đỉnh khi người dùng nhìn ở mức zoom xa.
3. **Bật thuộc tính `trackResize: false`** nếu vùng chứa bản đồ có kích thước cố định để giảm thiểu số lần tính toán bounding box của trình duyệt.
