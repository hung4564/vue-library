# Hệ thống điều khiển giao diện (Controls)

Thư viện cung cấp một tập hợp phong phú các nút bấm và thanh công cụ điều khiển giao diện (UI Controls), cùng với cơ chế bố cục (Control Layout) thông minh trên cả máy tính (Desktop) và điện thoại (Mobile).

---

## 1. Danh sách các Built-in Controls có sẵn

Các component này có thể được đặt lồng trực tiếp bên trong thẻ `<Map>`:

| Tên Control Component | Chức năng chính |
| :--- | :--- |
| `<ZoomControl />` | Nút phóng to (+), thu nhỏ (-) bản đồ |
| `<HomeControl />` | Nút quay về góc nhìn mặc định ban đầu |
| `<GotoControl />` | Bảng nhập tọa độ (DMS, độ thập phân) để bay đến vị trí |
| `<BaseMapControl />` | Bảng chọn chuyển đổi giữa các lớp bản đồ nền |
| `<FullScreenControl />`| Nút phóng to toàn màn hình trình duyệt |
| `<GeoLocateControl />` | Nút định vị GPS vị trí hiện tại của thiết bị người dùng |
| `<GlobeControl />` | Nút chuyển đổi qua lại giữa bản đồ phẳng và quả cầu 3D |
| `<MouseCoordinatesControl />` | Thanh hiển thị tọa độ con trỏ chuột và tỉ lệ xích bản đồ |
| `<MeasurementControl />` | Công cụ đo khoảng cách (đường) và đo diện tích (đa giác) |
| `<ThemeControl />` | Menu chọn giao diện sáng / tối / độ tương phản cao |
| `<LanguageControl />` | Menu chuyển đổi ngôn ngữ hiển thị (English / Tiếng Việt) |
| `<LayerControl />` | Cây danh mục quản lý bật/tắt, sắp xếp, lọc lớp bản đồ |
| `<PrintControl />` | Xuất bản đồ thành tệp ảnh PNG hoặc file in PDF |

---

## 2. Bố cục vị trí Control (`ModuleContainer` & Layout Store)

Các control được bố trí tại 4 góc chuẩn của bản đồ thông qua `ControlLayout`:
* `top-left`: Góc trên cùng bên trái.
* `top-right`: Góc trên cùng bên phải.
* `bottom-left`: Góc dưới cùng bên trái.
* `bottom-right`: Góc dưới cùng bên phải.

Hệ thống tự động sắp xếp các nút bấm thành các nhóm gọn gàng (`MapControlGroupButton`). Khi chạy trên màn hình thiết bị di động (Mobile breakpoint), các control mở rộng tự động thu gọn vào một nút menu nổi để không chiếm diện tích màn hình.

---

## 3. Tạo một Custom Control (Tự viết nút bấm tùy biến)

Bạn có thể dễ dàng tạo thêm một nút bấm công cụ chuyên biệt bằng hàm `buildMapControlHandle`:

```ts
import { 
  buildMapControlHandle, 
  runMapControlAction 
} from '@hungpvq/map-core';
import { UniversalRegistry } from '@hungpvq/map-core';

// 1. Khai báo Handle cho Control mới
export const myInspectControl = buildMapControlHandle({
  id: 'custom-inspect-button',
  title: 'Bật chế độ soi tọa độ',
  icon: 'mdi-crosshairs-gps', // class icon hoặc svg
  action: (map) => {
    map.getCanvas().style.cursor = 'crosshair';
    map.once('click', (e) => {
      alert(`Tọa độ điểm click: ${e.lngLat.lng.toFixed(5)}, ${e.lngLat.lat.toFixed(5)}`);
      map.getCanvas().style.cursor = '';
    });
  },
});

// 2. Đăng ký vào UniversalRegistry
UniversalRegistry.register('control', 'custom-inspect-button', myInspectControl);
```

Sau khi đăng ký, nút bấm này sẽ xuất hiện trên thanh công cụ `ToolbarControl` mà không cần sửa đổi mã nguồn gốc!
