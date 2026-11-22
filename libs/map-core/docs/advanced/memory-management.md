# Quản lý bộ nhớ chuyên sâu (Memory Management)

Bản đồ WebGL tiêu tốn bộ nhớ ở 3 khu vực:
1. **JavaScript Heap**: Lưu trữ cây Dataset, GeoJSON objects, các mảng tọa độ.
2. **GPU Video RAM (VRAM)**: Lưu trữ WebGL Buffers, Textures gạch bản đồ, Glyph fonts.
3. **Web Worker Threads**: Bộ nhớ đệm phân tích file và tính toán tile.

---

## 1. Vấn đề "WebGL Context Lost" và cách khắc phục

Mỗi trình duyệt chỉ cho phép tối đa khoảng 8 đến 16 WebGL Context hoạt động đồng thời trên một tab. Nếu bạn tạo liên tục các map instance mới (ví dụ chuyển tab hoặc mở modal) mà không hủy map cũ:
- Trình duyệt sẽ tự động hủy context cũ nhất, gây lỗi `WebGL Context Lost`.
- Toàn bộ canvas trước đó chuyển thành màu đen hoặc crash.

### Biện pháp xử lý:
Luôn đảm bảo gọi `map.remove()` khi đóng modal hoặc rời khỏi trang:
```ts
import { MapInitializer } from '@hungpvq/map-core';

// Khi đóng modal:
MapInitializer.cleanupMap(mapInstance);
```

---

## 2. Giới hạn dung lượng Tile Cache

MapLibre GL lưu trữ các tile vừa tải vào bộ nhớ cache. Bạn có thể giới hạn số lượng tile cache thông qua `maxTileCacheSize`:

```ts
const map = new maplibregl.Map({
  container: 'map',
  style: '...',
  maxTileCacheSize: 50, // Giới hạn tối đa 50 tiles trong RAM
});
```

---

## 3. Tránh Memory Leak do Event Listeners

Một trong những nguyên nhân rò rỉ bộ nhớ phổ biến nhất là đăng ký listener trên MapLibre nhưng closure giữ tham chiếu đến component cha:

```ts
// ❌ SAI: Tạo rò rỉ bộ nhớ vì closure giữ biến heavyComponentState
function badSetup(map) {
  const handler = () => { console.log(heavyComponentState); };
  map.on('click', handler);
  // Không bao giờ gọi map.off('click', handler)
}

// ✅ ĐÚNG: Dùng useEventListener từ adapter hoặc lưu hàm cleanup
function goodSetup(map) {
  const handler = () => { /* ... */ };
  map.on('click', handler);
  return () => map.off('click', handler);
}
```
