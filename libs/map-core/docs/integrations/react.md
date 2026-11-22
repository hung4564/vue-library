# Tích hợp với React 18 (React Integration)

Gói adapter `@hungpvq/react-map-*` được tối ưu hóa cho React 18 (hỗ trợ Concurrent Mode, Strict Mode và React Hooks).

---

## 1. Bootstrap toàn cục

Tại file khởi đầu của React (ví dụ: `src/main.tsx` hoặc `src/index.tsx`):

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { installMapApp } from '@hungpvq/react-map';
import '@hungpvq/react-map/style.css';
import { App } from './App';

// Gọi hàm cài đặt một lần duy nhất
installMapApp();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 2. Các Hooks chính trong React

### 1. `useMapContext()`
Truy cập thông tin mapId và map instance từ Context được cung cấp bởi component `<Map>`:

```tsx
import { useMapContext } from '@hungpvq/react-map-core';

export const MyCustomToolButton = () => {
  const { map, mapId } = useMapContext();

  const handleReset = () => {
    map?.flyTo({ center: [105.85, 21.03], zoom: 12 });
  };

  return <button onClick={handleReset}>Về trung tâm</button>;
};
```

---

### 2. `useMapDataset(mapId)`
Quản lý cây dataset trong React:

```tsx
import { useMapDataset } from '@hungpvq/react-map-dataset';

export const LayerManager = ({ mapId }: { mapId: string }) => {
  const { datasets, addDataset, removeDataset } = useMapDataset(mapId);

  return (
    <div>
      <h4>Danh sách lớp ({datasets.length})</h4>
      {datasets.map((ds) => (
        <div key={ds.id}>{ds.name}</div>
      ))}
    </div>
  );
};
```

---

## 3. Xử lý React 18 Strict Mode

Trong môi trường phát triển (Development Mode), `React.StrictMode` sẽ cố ý mount, unmount và remount lại component một lần nữa để phát hiện side-effects thừa. Component `<Map>` của `@hungpvq/react-map-core` đã được thiết kế sẵn cơ chế chống xung đột:
- Kiểm tra tính hợp lệ của canvas trước khi re-attach.
- Dọn dẹp an toàn các event listener khi unmount giả lập.
- Không tạo ra 2 thẻ canvas MapLibre trùng nhau trong DOM.
