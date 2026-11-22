# Câu hỏi thường gặp (FAQ)

Tổng hợp các câu hỏi kỹ thuật thường gặp khi tích hợp bộ thư viện `@hungpvq/map-*`.

---

## 1. Tôi có thể sử dụng thư viện với Mapbox GL JS thay vì MapLibre GL JS không?

**Trả lời**:  
Bộ thư viện được tối ưu hóa cho **MapLibre GL JS** (nhánh mã nguồn mở hoàn toàn miễn phí của Mapbox v1). Tuy nhiên, do MapLibre tuân thủ gần như 100% Mapbox Style Spec v8 và các API cốt lõi (`addSource`, `addLayer`, `setPaintProperty`, `queryRenderedFeatures`), bạn hoàn toàn có thể sử dụng Mapbox GL v1/v2 thông qua alias hoặc interface `MapSimple`. Lưu ý Mapbox GL v2+ yêu cầu Access Token riêng.

---

## 2. Làm thế nào để truy cập trực tiếp đối tượng MapLibre gốc?

**Trả lời**:  
Sử dụng hàm `getMap(mapId)` từ `@hungpvq/map-core`:

```ts
import { getMap } from '@hungpvq/map-core';

const map = getMap('my-map-id');
if (map) {
  // map chính là MapLibre instance, bạn có thể gọi bất kỳ API gốc nào
  map.flyTo({ center: [105.85, 21.03], zoom: 15 });
}
```

---

## 3. Làm thế nào để gán nhãn tiếng Việt cho toàn bộ bản đồ?

**Trả lời**:  
Gọi hàm `bootstrapMapLanguage('vi')` khi khởi động ứng dụng:

```ts
import { bootstrapMapLanguage } from '@hungpvq/map-core';

bootstrapMapLanguage('vi');
```
Tất cả các tooltip của nút bấm, menu cây layer và hộp thoại thông báo sẽ tự động hiển thị tiếng Việt.

---

## 4. Tại sao cây LayerControl không hiển thị menu ngữ cảnh?

**Trả lời**:  
Bạn cần chắc chắn đã gọi `installMapApp(app)` (trong Vue) hoặc `installMapApp()` (trong React) tại file khởi đầu. Hàm này thực hiện việc đăng ký các menu ngữ cảnh mặc định (`LayerMenuDefaultHandle`) vào `UniversalRegistry`. Nếu thiếu bước này, các menu thao tác layer sẽ không có hành động để render.

---

## 5. Làm sao để xuất toàn bộ bản đồ kèm các layer thành tệp ảnh PNG?

**Trả lời**:  
Bản đồ WebGL mặc định xóa bộ đệm sau khi vẽ (`preserveDrawingBuffer: false`). Để chụp ảnh canvas bản đồ:
1. Đảm bảo cấu hình MapOptions có `preserveDrawingBuffer: true`.
2. Sử dụng component `<PrintControl />` có sẵn trong `@hungpvq/vue-map-core` hoặc `@hungpvq/react-map-core`. Component này đã được tích hợp sẵn chức năng render và tải file ảnh về máy tính.
