# Tra cứu API: Functions (Hàm chức năng & Services)

Danh sách các hàm tiện ích và API chức năng phổ biến nhất trong hệ sinh thái.

---

## 1. Truy xuất & Đăng ký Map Platform (`@hungpvq/map-core`)

### `getMap(mapId: string): MapSimple | undefined`
Truy xuất đối tượng `MapSimple` tương ứng với `mapId`.
* **Tham số**: `mapId` (chuỗi định danh bản đồ).
* **Trả về**: Đối tượng `MapSimple` hoặc `undefined` nếu bản đồ chưa sẵn sàng.

### `subscribeMapReady(mapId: string, cb: (map: MapSimple) => void): () => void`
Lắng nghe sự kiện bản đồ sẵn sàng. Nếu bản đồ đã tải xong từ trước, callback sẽ được gọi ngay lập tức.
* **Trả về**: Hàm `unsubscribe()` để hủy lắng nghe.

### `registerMapAccessor(mapId: string, accessor: () => MapSimple | undefined, options?: RegisterMapPlatformOptions): MapPlatformRegistration`
Đăng ký hàm lấy instance của một bản đồ vào platform registry.

---

## 2. Tạo & Xử lý Dataset (`@hungpvq/map-dataset/geojson`)

### `createGeoJsonDataset(options: GeojsonDatasetOption): Promise<IDataset>`
Tạo nhanh một Dataset dạng lá (`DatasetLeaf`) từ đối tượng hoặc URL GeoJSON.
* **Tham số**: `options` chứa `id`, `name`, `data`, `color`, `opacity`.
* **Trả về**: Đối tượng `IDataset` đã cấu hình sẵn source và layer.

### `loadGeojsonFileAsync(file: File): Promise<GeoJSON.FeatureCollection>`
Sử dụng Web Worker chạy ngầm để đọc và phân tích file `.geojson`, `.json`, `.kml`, `.zip` (shapefile) mà không làm đơ giao diện.

### `reprojectGeojsonAsync(data: GeoJSON.GeoJSON, fromEpsg: string, toEpsg: string): Promise<GeoJSON.GeoJSON>`
Chuyển đổi hệ tọa độ của đối tượng GeoJSON trên Web Worker sử dụng Proj4.

---

## 3. Điều khiển View & Hình học (`@hungpvq/map-core`)

### `fitBounds(map: MapSimple, bbox: [number, number, number, number], options?: FitBoundsOptions): void`
Tự động căn chỉnh góc nhìn của bản đồ để bao trọn hộp tọa độ `[minLng, minLat, maxLng, maxLat]`.

### `degToDms(deg: number): { d: number, m: number, s: number }`
Chuyển đổi độ thập phân sang Độ-Phút-Giây.

### `dmsToDeg(d: number, m: number, s: number): number`
Chuyển đổi Độ-Phút-Giây sang độ thập phân.

---

## 4. Theme & Đa ngôn ngữ (`@hungpvq/map-core`)

### `bootstrapMapTheme(mode: MapThemeMode, options?: ApplyMapThemeOptions): void`
Áp dụng theme màu cho toàn bộ ứng dụng hoặc riêng cho một container map.

### `bootstrapMapLanguage(lang: 'en' | 'vi'): void`
Thay đổi ngôn ngữ hiển thị của toàn bộ các control và thông báo trong hệ thống.
