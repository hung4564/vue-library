# Tra cứu API: Interfaces (Giao diện dữ liệu)

Tài liệu này định nghĩa chi tiết các Interface cốt lõi được sử dụng trong toàn bộ hệ sinh thái.

---

## 1. `IDataset` (`@hungpvq/map-dataset`)

Giao diện cơ sở mà mọi Dataset (cả Leaf lẫn Composite) đều phải tuân thủ:

```ts
export interface IDataset {
  /** Định danh duy nhất của dataset */
  readonly id: string;
  
  /** Tên hiển thị trên cây danh mục LayerControl */
  name: string;
  
  /** Trạng thái hiển thị (bật/tắt) */
  visible?: boolean;
  
  /** Độ mờ hiển thị (0.0 đến 1.0) */
  opacity?: number;
  
  /** Gắn các layer vào MapLibre instance */
  addToMap(map: MapSimple): void;
  
  /** Gỡ bỏ các layer khỏi MapLibre instance */
  removeFromMap(map: MapSimple): void;
}
```

---

## 2. `MapSimple` (`@hungpvq/map-core`)

Giao diện trừu tượng đại diện cho MapLibre GL Map instance:

```ts
export interface MapSimple {
  readonly id?: string;
  getCenter(): { lng: number; lat: number };
  setCenter(center: [number, number]): this;
  getZoom(): number;
  setZoom(zoom: number): this;
  getPitch(): number;
  setPitch(pitch: number): this;
  getBearing(): number;
  setBearing(bearing: number): this;
  getCanvas(): HTMLCanvasElement;
  getContainer(): HTMLElement;
  addSource(id: string, source: any): this;
  removeSource(id: string): this;
  getSource(id: string): any;
  addLayer(layer: any, beforeId?: string): this;
  removeLayer(id: string): this;
  getLayer(id: string): any;
  setLayoutProperty(layerId: string, name: string, value: any): this;
  setPaintProperty(layerId: string, name: string, value: any): this;
  queryRenderedFeatures(pointOrBox?: any, options?: any): any[];
  on(type: string, listener: (e: any) => void): this;
  on(type: string, layerId: string, listener: (e: any) => void): this;
  off(type: string, listener: (e: any) => void): this;
  off(type: string, layerId: string, listener: (e: any) => void): this;
  once(type: string, listener: (e: any) => void): this;
  resize(): this;
  remove(): void;
}
```

---

## 3. `MapControlHandle` (`@hungpvq/map-core`)

Giao diện mô tả một nút điều khiển công cụ trên bản đồ:

```ts
export interface MapControlHandle {
  /** ID duy nhất */
  id: string;
  
  /** Tên nhãn hoặc key dịch i18n */
  title: string;
  
  /** Icon biểu diễn (MDI icon name hoặc chuỗi SVG) */
  icon: string;
  
  /** Hành động khi người dùng nhấp chuột */
  action: (map: MapSimple, meta?: any) => void;
  
  /** Loại panel mở rộng nếu có */
  panelKind?: 'popup' | 'sidebar' | 'dialog';
}
```

---

## 4. `GeojsonDatasetOption` (`@hungpvq/map-dataset/geojson`)

Tùy chọn khi khởi tạo một GeoJSON Dataset:

```ts
export interface GeojsonDatasetOption {
  id: string;
  name: string;
  data: GeoJSON.FeatureCollection | GeoJSON.Feature | string; // Object hoặc URL
  color?: string;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  show?: boolean;
}
```
