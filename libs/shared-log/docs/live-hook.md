# Live Hook Tracing (Theo dõi Tiến trình Thực thi)

Live Hook là cơ chế của `@hungpvq/shared-log` cho phép theo dõi dòng đời của các tác vụ (Lifecycle Actions), đo lường thời gian thực thi (Performance Timing) và vẽ cây tiến trình (Request Flow Tree) trong giao diện Devtools.

---

## 1. Khái niệm Live Trace

Khác với log truyền thống chỉ xuất hiện từng dòng riêng lẻ, Live Trace theo dõi toàn bộ chuỗi hành động có điểm bắt đầu, các bước trung gian và thời điểm hoàn thành. Mọi bản ghi Live Trace đều phát ra `DebugRecord` với:

```ts
header.kind = 'live'
```

Nhờ đó, tab **Live** trong Devtools có thể tái hiện dạng cây (Hierarchy Tree) hoặc danh sách tiến trình theo thời gian thực.

---

## 2. Sử dụng trong Core (`@hungpvq/shared-log`)

Hàm `trackLiveEventAction` cho phép theo dõi một hàm bất đồng bộ hoặc đồng bộ:

```ts
import { trackLiveEventAction } from '@hungpvq/shared-log';

async function uploadDatasetFile(file: File) {
  return trackLiveEventAction(
    {
      action: 'dataset:upload',
      name: `Upload ${file.name}`,
      data: { size: file.size, type: file.type },
    },
    async (context) => {
      // Ghi nhận bước tiến hành
      context.step('parsing:geojson', { stage: 1 });
      const parsed = await parseGeojson(file);

      context.step('reprojecting:crs', { stage: 2 });
      const reprojected = await reproject(parsed);

      return reprojected;
    }
  );
}
```

---

## 3. Sử dụng trong Vue 3 (`@hungpvq/vue-shared-log`)

Package `@hungpvq/vue-shared-log` cung cấp composable `useLiveHookDebug` để theo dõi vòng đời component hoặc các hành động người dùng:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useLiveHookDebug } from '@hungpvq/vue-shared-log';

const { trackAction } = useLiveHookDebug({
  namespace: 'map:draw',
  componentName: 'DrawToolbar',
});

const isDrawing = ref(false);

async function handleStartDraw(mode: string) {
  await trackAction('startDrawMode', { mode }, async () => {
    isDrawing.value = true;
    // logic khởi động chế độ vẽ
  });
}
</script>

<template>
  <button @click="handleStartDraw('polygon')">Vẽ Polygon</button>
</template>
```

---

## 4. Sử dụng trong React 18 (`@hungpvq/react-shared-log`)

Trong React, bạn có thể dùng hook `useLiveHookDebug` hoặc bọc cây component bằng `LiveHookScope`:

### Dùng Hook:

```tsx
import React, { useState } from 'react';
import { useLiveHookDebug } from '@hungpvq/react-shared-log';

export function LayerItem({ layerId }: { layerId: string }) {
  const { trackAction } = useLiveHookDebug({
    namespace: 'map:layer',
    componentName: 'LayerItem',
  });

  const [visible, setVisible] = useState(true);

  const toggleVisibility = async () => {
    await trackAction('toggleLayer', { layerId, current: visible }, async () => {
      setVisible((prev) => !prev);
      // Gọi service cập nhật bản đồ
    });
  };

  return (
    <div>
      <span>Layer: {layerId}</span>
      <button onClick={toggleVisibility}>
        {visible ? 'Ẩn' : 'Hiện'}
      </button>
    </div>
  );
}
```

### Dùng `LiveHookScope` để nhóm ngữ cảnh:

```tsx
import { LiveHookScope } from '@hungpvq/react-shared-log';

export function MapInspectionSection() {
  return (
    <LiveHookScope namespace="map:inspect" scopeId="inspection_panel">
      <LayerItem layerId="layer_roads" />
      <LayerItem layerId="layer_buildings" />
    </LiveHookScope>
  );
}
```

---

## 5. Các hàm hỗ trợ Live Trace

```ts
import {
  getLiveTraceEvents,
  clearLiveTraceEvents,
  subscribeLiveTrace,
} from '@hungpvq/shared-log';

// Lấy danh sách toàn bộ sự kiện trace hiện tại
const events = getLiveTraceEvents();

// Đăng ký lắng nghe sự kiện trace mới theo thời gian thực
const unsubscribe = subscribeLiveTrace((event) => {
  console.log('Trace event mới:', event);
});

// Xóa danh sách trace
clearLiveTraceEvents();
```
