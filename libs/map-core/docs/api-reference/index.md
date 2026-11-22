# API Reference Index

Chào mừng bạn đến với tài liệu tra cứu API chi tiết của bộ thư viện `@hungpvq/map-*`. Danh mục API được trích xuất và kiểm chứng 100% từ mã nguồn TypeScript thực tế.

---

## 📚 Phân loại tra cứu

* [**Classes (Lớp đối tượng)**](./classes.md): `MapInitializer`, `MapStoreManager`, `UniversalRegistry`, `DrawService`, `DatasetComposite`, `DatasetLeaf`, `BasemapService`, `InspectController`, `WorkerMonitor`, `MapErrorHandler`...
* [**Interfaces (Giao diện dữ liệu)**](./interfaces.md): `IDataset`, `MapSimple`, `MapOptions`, `MapControlHandle`, `MapEventCallbacks`, `CreateDataManagementOptions`, `GeojsonDatasetOption`...
* [**Types & Enums (Kiểu & Hằng số)**](./types.md): `DrawingType`, `MapThemeId`, `MapThemeMode`, `MapPlatformHostId`, `MapControlPanelPosition`, `ComponentType`...
* [**Functions (Hàm chức năng & Services)**](./functions.md): `getMap`, `subscribeMapReady`, `registerMapAccessor`, `createGeoJsonDataset`, `createVectorTileDataset`, `buildMapControlHandle`, `bootstrapMapLanguage`, `bootstrapMapTheme`, `fitBounds`...
* [**Events (Sự kiện & Payloads)**](./events.md): `MAP_CORE_EVENT`, `MittTypeMapEventKey`, `MittTypeBaseMapEventKey`, `DrawCreateEvent`, `DrawUpdateEvent`, `DrawDeleteEvent`...

---

## 📦 Bản đồ Subpath Exports chính xác

### `@hungpvq/map-core`
* `.` (root): Lõi nền tảng (`MapInitializer`, `MapStoreManager`, `UniversalRegistry`, `getMap`...)
* `@hungpvq/map-core/basemap`: Quản lý lớp nền (`BasemapService`, `INIT_BASEMAPS`, `BaseMapAdapter`)
* `@hungpvq/map-core/crs`: Quản lý hệ tọa độ & chuyển đổi CRS (`reprojectGeojson`)
* `@hungpvq/map-core/theme`: Quản lý 7 theme màu và độ tương phản (`bootstrapMapTheme`, `MAP_THEME_IDS`)
* `@hungpvq/map-core/toolbar`: Bố cục thanh công cụ (`ToolbarControl`)
* `@hungpvq/map-core/measurement`: Logic đo đạc chiều dài & diện tích (`MeasurementControl`)
* `@hungpvq/map-core/print`: Xuất ảnh bản đồ và tài liệu in (`PrintControl`)
* `@hungpvq/map-core/worker`: Điều phối tiến trình Web Worker (`WorkerMonitor`)

### `@hungpvq/map-dataset`
* `.` (root): Quản lý cây dataset (`createDataset`, `DatasetComposite`, `DatasetLeaf`, `DatasetService`)
* `@hungpvq/map-dataset/geojson`: Xử lý dữ liệu GeoJSON (`createGeoJsonDataset`, `loadGeojsonFileAsync`)
* `@hungpvq/map-dataset/vector-tile`: Xử lý Vector Tiles PBF/MVT (`createVectorTileDataset`)
* `@hungpvq/map-dataset/raster`: Xử lý Raster Tiles XYZ/WMTS (`createRasterDataset`)
* `@hungpvq/map-dataset/identify`: Tra cứu thông tin đối tượng (`IdentifyService`)
* `@hungpvq/map-dataset/style`: Khởi tạo và cập nhật style động theo thuộc tính

### `@hungpvq/map-draw`
* `.` (root): Dịch vụ vẽ và chỉnh sửa (`DrawService`, `DrawingType`, `InspectController`)
