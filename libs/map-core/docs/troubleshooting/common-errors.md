# Xử lý các lỗi thường gặp (Common Errors)

Tài liệu này tổng hợp các lỗi phổ biến nhất khi phát triển ứng dụng với `@hungpvq/map-*` và cách khắc phục dứt điểm.

---

## 1. Lỗi: `MapInitializationError: WebGL is not supported in this browser`

### Nguyên nhân:
* Trình duyệt đang chạy trên máy ảo hoặc môi trường CI/CD không có GPU ảo hóa.
* Tính năng "Hardware Acceleration" trong cài đặt trình duyệt bị tắt.
* Driver card màn hình bị lỗi hoặc quá cũ.

### Cách khắc phục:
1. Vào `chrome://settings/system` và bật tùy chọn **"Use hardware acceleration when available"**.
2. Kiểm tra `chrome://gpu` để xem trạng thái WebGL có phải là "Hardware accelerated" hay không.
3. Trong mã nguồn, bọc khối khởi tạo bằng `try/catch` để hiển thị thông báo thân thiện:
   ```ts
   try {
     MapInitializer.validateWebglSupport(mapId);
   } catch {
     showFallbackUi('Vui lòng bật tăng tốc phần cứng trong trình duyệt để xem bản đồ.');
   }
   ```

---

## 2. Bản đồ bị vỡ layout / Các nút control bị mất giao diện

### Nguyên nhân:
* Chưa import file CSS của thư viện tại điểm khởi đầu ứng dụng.

### Cách khắc phục:
Đảm bảo đã import file CSS trong `main.ts` hoặc `index.tsx`:
```ts
// Nếu dùng Meta package:
import '@hungpvq/vue-map/style.css'; // hoặc @hungpvq/react-map/style.css

// Nếu dùng từng gói riêng:
import '@hungpvq/map-core/style.css';
import '@hungpvq/map-dataset/style.css';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
import '@hungpvq/vue-draggable/style.css';
```

---

## 3. Bản đồ hiển thị một vệt xám nhỏ hoặc canvas kích thước 0px

### Nguyên nhân:
* Thẻ cha (container DOM) chưa có chiều cao cố định hoặc component được khởi tạo bên trong một tab / modal đang ẩn (`display: none`).

### Cách khắc phục:
1. Đảm bảo thẻ cha có CSS:
   ```css
   .map-container {
     width: 100%;
     height: 100vh; /* hoặc chiều cao px cố định */
     position: relative;
   }
   ```
2. Nếu mở trong Modal hoặc Tab, gọi `map.resize()` ngay sau khi modal mở:
   ```ts
   import { getMap } from '@hungpvq/map-core';

   onModalOpen(() => {
     nextTick(() => {
       const map = getMap('my-map-id');
       map?.resize();
     });
   });
   ```

---

## 4. Lỗi: `Cannot read private member` khi dùng Vue 3

### Nguyên nhân:
* Bạn đã lưu instance của map vào `reactive()` hoặc `ref()` sâu của Vue.

### Cách khắc phục:
Chuyển sang dùng `shallowRef`:
```ts
import { shallowRef } from 'vue';
const map = shallowRef<MapSimple | null>(null);
```
