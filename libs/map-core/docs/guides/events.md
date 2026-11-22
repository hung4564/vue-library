# Bắt và xử lý sự kiện (Events Guide)

Tài liệu này cung cấp các mô hình thực tế để lắng nghe, lọc và hủy bỏ các sự kiện tương tác giữa người dùng và bản đồ.

---

## 1. Lắng nghe sự kiện bản đồ trong Vue qua `useEventListener`

Thay vì tự gọi `map.on` và quên gọi `map.off` khi unmount dẫn đến rò rỉ bộ nhớ, hãy sử dụng composable `useEventListener`:

```vue
<script setup lang="ts">
import { useEventListener } from '@hungpvq/vue-map-core';

const mapId = 'my-map-app';

// Tự động hủy đăng ký khi component bị unmount!
useEventListener(mapId, 'click', (e) => {
  console.log('Click tại tọa độ:', e.lngLat);
});

useEventListener(mapId, 'zoomend', () => {
  console.log('Mức zoom mới sau khi thay đổi');
});
</script>
```

---

## 2. Lắng nghe sự kiện bản đồ trong React qua `useEventListener`

Tương tự trong React, hook `useEventListener` gắn sự kiện an toàn và tự động dọn dẹp trong hàm cleanup của `useEffect`:

```tsx
import React from 'react';
import { useEventListener } from '@hungpvq/react-map-core';

export const CoordinatesMonitor: React.FC<{ mapId: string }> = ({ mapId }) => {
  useEventListener(mapId, 'mousemove', (e) => {
    console.log(`Con trỏ tại: [${e.lngLat.lng.toFixed(4)}, ${e.lngLat.lat.toFixed(4)}]`);
  });

  return <div className="coords-panel">Theo dõi tọa độ đang bật...</div>;
};
```

---

## 3. Lắng nghe sự kiện Long-press trên thiết bị cảm ứng

Trên màn hình cảm ứng di động, sự kiện click chuột phải (contextmenu) thường không khả dụng. Thư viện cung cấp hàm `bindMapLongPress`:

```ts
import { bindMapLongPress } from '@hungpvq/map-core';
import { getMap } from '@hungpvq/map-core';

const map = getMap('my-map-id');
if (map) {
  // Nhấn giữ 600ms trên màn hình cảm ứng
  const unbind = bindMapLongPress(map, {
    delay: 600,
    onLongPress: (e) => {
      console.log('Người dùng nhấn giữ tại:', e.lngLat);
      // Hiển thị menu ngữ cảnh tại vị trí nhấn giữ
    },
  });

  // Hủy lắng nghe khi cần:
  // unbind();
}
```
