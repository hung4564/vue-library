# Tra cứu API: Events (Sự kiện & Payloads)

Danh sách chi tiết các sự kiện được phát ra trong hệ thống `@hungpvq/map-*`.

---

## 1. Hằng số sự kiện hệ thống `MAP_CORE_EVENT`

```ts
export const MAP_CORE_EVENT = {
  ready: 'map:ready',       // Khi map tải xong style và gán accessor
  error: 'map:error',       // Khi xảy ra lỗi runtime trong canvas hoặc nạp tile
  destroy: 'map:destroy',   // Khi map bắt đầu bị hủy
  resize: 'map:resize',     // Khi kích thước container DOM thay đổi
} as const;
```

---

## 2. Các sự kiện vẽ Mapbox GL Draw (`@hungpvq/map-draw`)

Các sự kiện phát ra từ `DrawService` khi người dùng thao tác vẽ hoặc chỉnh sửa:

| Tên sự kiện | Payload Interface | Mô tả |
| :--- | :--- | :--- |
| `draw.create` | `DrawCreateEvent { features: Feature[] }` | Người dùng hoàn thành một nét vẽ mới |
| `draw.update` | `DrawUpdateEvent { features: Feature[], action: string }` | Người dùng kéo đỉnh hoặc di chuyển hình vẽ |
| `draw.delete` | `DrawDeleteEvent { features: Feature[] }` | Người dùng xóa một hoặc nhiều hình vẽ |
| `draw.selectionchange` | `DrawSelectionChangeEvent { features: Feature[] }` | Người dùng bấm chọn hoặc bỏ chọn hình vẽ |
| `draw.modechange` | `DrawModeChangeEvent { mode: string }` | Chuyển đổi chế độ vẽ (ví dụ từ `draw_polygon` sang `simple_select`) |

---

## 3. Sự kiện chuyển đổi lớp nền (`MittTypeBaseMapEventKey`)

Phát ra từ `BaseMapStore` khi người dùng chuyển đổi bản đồ nền:

```ts
export const MittTypeBaseMapEventKey = {
  changeBaseMap: 'changeBaseMap',
  changeOpacity: 'changeOpacity',
} as const;
```

* `changeBaseMap`: Payload chứa `{ id: string, item: BaseMapItem }`.
* `changeOpacity`: Payload chứa `{ opacity: number }` (từ 0 đến 1).
