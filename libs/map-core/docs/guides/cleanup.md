# Hướng dẫn Dọn dẹp & Chống rò rỉ bộ nhớ (Cleanup Guide)

Trong các ứng dụng Single Page Application (Vue Router, React Router), người dùng liên tục chuyển đổi giữa các trang. Nếu bản đồ WebGL không được dọn dẹp kỹ, ứng dụng sẽ tích tụ hàng trăm MB RAM và gây crash trình duyệt do cạn kiệt WebGL context.

---

## 1. Cơ chế tự động dọn dẹp của Component `<Map>`

Nếu bạn sử dụng component `<Map>` từ `@hungpvq/vue-map-core` hoặc `@hungpvq/react-map-core`, hệ thống **đã tự động dọn dẹp**:
* Trong Vue: Hook `onUnmounted` tự động gọi hàm cleanup.
* Trong React: Hàm cleanup của `useEffect` tự động gọi hàm cleanup.

Quá trình tự động này bao gồm:
1. Gỡ bỏ `ResizeObserver` theo dõi kích thước thẻ DOM.
2. Hủy các sự kiện bàn phím toàn cục (Esc, `/`).
3. Gỡ instance khỏi `MapPlatformRegistry` (`unregisterMapAccessor`).
4. Gọi `map.remove()` để hủy GPU canvas.

---

## 2. Dọn dẹp thủ công khi sử dụng Vanilla JS / TS

Khi tự viết mã quản lý bản đồ ngoài framework component, bạn **bắt buộc** phải gọi hàm dọn dẹp:

```ts
import { MapInitializer, getMap, deleteMapDomainStore } from '@hungpvq/map-core';

export function destroyMapInstance(mapId: string) {
  const map = getMap(mapId);
  
  if (map) {
    // 1. Dọn dẹp MapLibre canvas và callbacks
    MapInitializer.cleanupMap(map, {
      onDestroy: (m) => {
        console.log(`Bắt đầu hủy bản đồ: ${mapId}`);
      },
    });

    // 2. Xóa các scoped stores liên kết với mapId này
    deleteMapDomainStore(mapId, 'basemap');
    deleteMapDomainStore(mapId, 'dataset');
    deleteMapDomainStore(mapId, 'draw');
    deleteMapDomainStore(mapId, 'event');

    console.log(`Đã giải phóng hoàn toàn tài nguyên cho: ${mapId}`);
  }
}
```

---

## 3. Checklist phòng ngừa rò rỉ bộ nhớ (Best Practices Checklist)

> [!IMPORTANT]
> Hãy luôn tuân thủ 5 nguyên tắc sau:
> 1. **Không lưu trữ Map instance trong Vue `reactive()` hoặc `ref()` sâu**: Vue Reactivity Proxy sẽ bọc qua hàng ngàn phương thức nội bộ của WebGL engine và gây lag nghiêm trọng. Hãy dùng `shallowRef(null)` hoặc biến thường.
> 2. **Luôn lưu trữ hàm hủy (Unsubscribe)**: Khi gọi `subscribeMapReady()`, `mitt.on()`, hoặc `bindMapLongPress()`, luôn lưu lại hàm trả về và thực thi nó khi đóng component.
> 3. **Giải phóng Web Worker**: Nếu bạn gọi `configureGisWorker()`, hãy gọi `terminateGeojsonWorker()` khi ứng dụng kết thúc phiên làm việc.
> 4. **Tránh re-initialization trong React Strict Mode**: Trong môi trường `development`, React 18 mount/unmount component 2 lần. Đảm bảo cờ `isMounted` hoặc dùng hook chuẩn `useMapInstance()` để không tạo 2 canvas đè lên nhau.
