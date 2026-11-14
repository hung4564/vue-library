# Tra cứu API: Classes (Lớp đối tượng)

Tài liệu này mô tả chi tiết các Class quan trọng trong thư viện, bao gồm mục đích, constructor, phương thức và ví dụ thực tế.

---

## 1. `MapInitializer` (`@hungpvq/map-core`)

Class tiện ích tĩnh (static class) cung cấp các phương thức chuẩn hóa việc khởi tạo và dọn dẹp MapLibre instance.

### Static Methods:

| Tên phương thức | Tham số | Giá trị trả về | Mô tả |
| :--- | :--- | :--- | :--- |
| `isWebglSupported()` | Không | `boolean` | Kiểm tra trình duyệt có hỗ trợ WebGL 1.0 hoặc 2.0 hay không |
| `validateWebglSupport(mapId)` | `mapId: string` | `void` | Ném ra lỗi `MapInitializationError` nếu WebGL bị vô hiệu hóa |
| `createDefaultOptions(customOptions?)` | `customOptions?: Partial<MapOptions>` | `Partial<MapOptions>` | Tạo đối tượng MapOptions với các giá trị mặc định tối ưu (center Việt Nam, attribution false, zoom 5.3) |
| `createMapStyle(customStyle?)` | `customStyle?: Partial<Style>` | `object` | Tạo Style JSON rỗng chuẩn (version 8, demotiles glyphs) |
| `setupMapEvents(map, callbacks)` | `map: MapSimple`, `callbacks: MapEventCallbacks` | `() => void` | Gắn sự kiện `load` và `error` chuẩn hóa, trả về hàm cleanup |
| `cleanupMap(map, callbacks?)` | `map: MapSimple`, `callbacks?: MapEventCallbacks` | `void` | Thực thi callback onDestroy và gọi `map.remove()` |

---

## 2. `MapStoreManager` (`@hungpvq/map-core`)

Singleton quản lý các store trạng thái phân tầng theo từng `mapId`.

### Methods:
* `getStore(mapId: string): MapStore`: Lấy store gốc của bản đồ.
* `subscribeMapReady(mapId: string, cb: (map: MapSimple) => void): () => void`: Đăng ký callback khi map sẵn sàng.
* `clearMapStore(mapId: string): void`: Xóa bỏ toàn bộ dữ liệu store khi hủy bản đồ.

---

## 3. `UniversalRegistry` (`@hungpvq/map-core`)

Điểm lưu trữ và phân phối các tiện ích mở rộng (Plugin / Extension registry).

### Static Methods:
* `register<T>(namespace: RegistryNamespaceKind, key: string, value: T): void`: Đăng ký một giá trị vào namespace (`control`, `menu`, `format`).
* `get<T>(namespace: RegistryNamespaceKind, key: string): T | undefined`: Lấy giá trị đã đăng ký.
* `list(namespace: RegistryNamespaceKind): string[]`: Liệt kê tất cả các key thuộc namespace.
* `unregister(namespace: RegistryNamespaceKind, key: string): void`: Hủy đăng ký.

---

## 4. `DatasetService` (`@hungpvq/map-dataset`)

Lớp dịch vụ trung tâm điều phối nạp, xóa và đồng bộ hóa cây dữ liệu trên bản đồ.

### Methods:
* `register(dataset: IDataset): void`: Đăng ký dataset vào store.
* `unregister(datasetId: string): void`: Gỡ bỏ dataset khỏi store.
* `getDataset(datasetId: string): IDataset | undefined`: Truy vấn dataset theo id.
* `findDatasetByLayerId(layerId: string): IDataset | undefined`: Tìm kiếm dataset sở hữu layer tương ứng trên MapLibre.

---

## 5. `DrawService` (`@hungpvq/map-draw`)

Lớp điều khiển tương tác vẽ và chỉnh sửa hình học không gian dựa trên Mapbox GL Draw.

### Constructor:
```ts
new DrawService(map: MapSimple, options?: MapDrawOptions)
```

### Methods:
* `startDraw(type: DrawingType, callback: (feat: Feature) => void): void`: Bật chế độ vẽ một hình học cụ thể (Point, LineString, Polygon, Circle, Rectangle).
* `stopDraw(): void`: Dừng chế độ vẽ và trả con trỏ chuột về mặc định.
* `deleteAll(): void`: Xóa toàn bộ các đối tượng đang vẽ tạm trên bản đồ.
* `getSelected(): Feature[]`: Lấy danh sách các đối tượng đang được chọn.
* `setFeatures(fc: FeatureCollection): void`: Nạp một FeatureCollection vào phiên làm việc của công cụ vẽ.
