# Hệ thống sự kiện (Event System)

Hệ thống sự kiện trong bộ thư viện `@hungpvq/map-*` được thiết kế theo mô hình **Event-Driven Architecture**, kết hợp giữa các sự kiện bản đồ gốc của MapLibre GL và Event Emitter nội bộ dựa trên thư viện siêu nhẹ `mitt`.

---

## 1. Phân loại sự kiện trong hệ thống

Hệ thống bao gồm 3 lớp sự kiện chính:

1. **Native Map Events**: Các sự kiện chuột và cảm ứng phát ra trực tiếp từ canvas WebGL (`click`, `dblclick`, `mousemove`, `zoomend`, `moveend`).
2. **Platform & Store Events (`MAP_CORE_EVENT`)**: Các sự kiện vòng đời và trạng thái hệ thống phát ra từ `MapStoreManager` (ví dụ: `ready`, `error`, `destroy`, `resize`).
3. **Dataset & Domain Events**: Các sự kiện thay đổi dữ liệu (ví dụ: `datasetAdded`, `datasetRemoved`, `visibilityChanged`, `drawCreated`).

---

## 2. Hằng số sự kiện hệ thống `MAP_CORE_EVENT`

Các sự kiện vòng đời được định nghĩa trong enum/object `MAP_CORE_EVENT`:

```ts
import { MAP_CORE_EVENT } from '@hungpvq/map-core';

console.log(MAP_CORE_EVENT);
// Bao gồm các key chính:
// MAP_CORE_EVENT.ready: Bản đồ đã sẵn sàng
// MAP_CORE_EVENT.error: Bắt được lỗi runtime
// MAP_CORE_EVENT.destroy: Bản đồ bị giải phóng
// MAP_CORE_EVENT.resize: Kích thước bản đồ thay đổi
```

---

## 3. Cách đăng ký và lắng nghe sự kiện

### Cách 1: Sử dụng `subscribeMapReady` (Khuyến nghị cho việc chờ bản đồ sẵn sàng)
```ts
import { subscribeMapReady } from '@hungpvq/map-core';

// Hàm trả về một cleanup function để hủy đăng ký khi không cần thiết
const unsubscribe = subscribeMapReady('my-map-id', (map) => {
  console.log('Map instance đã sẵn sàng tương tác:', map);
  
  // Gắn sự kiện click
  map.on('click', (e) => {
    console.log(`Tọa độ bấm: [${e.lngLat.lng}, ${e.lngLat.lat}]`);
  });
});

// Khi hủy component:
// unsubscribe();
```

---

### Cách 2: Sử dụng `createMapMitt` (Event Bus cục bộ)
Khi cần giao tiếp giữa các component hoặc control mà không muốn tạo liên kết cứng, bạn có thể sử dụng mitt store:

```ts
import { createMapMitt, MittTypeMapEventKey } from '@hungpvq/map-core';

const mitt = createMapMitt();

// Lắng nghe sự kiện
mitt.on(MittTypeMapEventKey.mapReady, (mapInstance) => {
  console.log('Nhận thông báo mapReady từ event bus');
});

// Phát sự kiện
mitt.emit(MittTypeMapEventKey.mapReady, myMapInstance);
```

---

### Cách 3: Bắt lỗi toàn cục với `MapErrorHandler`
Tất cả các lỗi xảy ra trong quá trình khởi tạo hoặc render đều được chuyển hướng qua `errorHandler`:

```ts
import { errorHandler } from '@hungpvq/map-core';

// Bắt các lỗi xảy ra trong map
errorHandler.subscribe((errorEvent) => {
  console.error('[Map Error Caught]:', errorEvent.message, errorEvent.cause);
  
  // Hiển thị toast thông báo cho người dùng
  myToastService.showError(errorEvent.message);
});
```

---

## 4. Bảng tổng hợp các sự kiện phổ biến

| Tên sự kiện | Đối tượng phát | Payload | Mô tả |
| :--- | :--- | :--- | :--- |
| `load` | MapLibre Instance | `Event` | Style cơ sở và glyph đã nạp xong |
| `ready` | `MapStoreManager` | `MapSimple` | Map instance đã được gán accessor và sẵn sàng |
| `click` | MapLibre Instance | `MapMouseEvent` | Người dùng click vào bản đồ (kèm `lngLat`, `point`) |
| `error` | `errorHandler` / Map | `MapEventError` | Lỗi nạp tile, lỗi WebGL context hoặc style không hợp lệ |
| `draw.create` | Mapbox GL Draw | `{ features: Feature[] }` | Người dùng vừa vẽ xong một hình học mới |
| `draw.update` | Mapbox GL Draw | `{ features: Feature[], action: string }` | Người dùng chỉnh sửa đỉnh hoặc di chuyển hình vẽ |
| `draw.delete` | Mapbox GL Draw | `{ features: Feature[] }` | Người dùng xóa hình vẽ |
