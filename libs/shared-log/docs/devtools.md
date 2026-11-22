# Devtools Shell & Quản lý Debug Tab

Giao diện **Devtools Shell** cung cấp bảng điều khiển chẩn đoán tích hợp (Overlay / Panel) cho phép lập trình viên theo dõi trạng thái ứng dụng, logs, lỗi và tiến trình thực thi trực tiếp trên trình duyệt.

---

## 1. Tích hợp Devtools Shell

Devtools Shell hỗ trợ cả Vue 3 và React 18.

### Trong Vue 3:

```vue
<script setup lang="ts">
import { installDebug } from '@hungpvq/shared-log';
import { DevtoolsShell, registerBuiltinDebugTabs } from '@hungpvq/vue-shared-log';
import '@hungpvq/vue-shared-log/style.css';

// 1. Khởi tạo core debug (IndexedDB storage & window helper)
installDebug();

// 2. Đăng ký các tab mặc định (Store, Live, Logs, Errors, Tabs)
registerBuiltinDebugTabs();
</script>

<template>
  <div class="app-container">
    <router-view />
    <!-- Gắn DevtoolsShell ở góc màn hình hoặc trong modal -->
    <DevtoolsShell />
  </div>
</template>
```

### Trong React 18:

```tsx
import React, { useEffect } from 'react';
import { installDebug } from '@hungpvq/shared-log';
import { DevtoolsShell, registerBuiltinDebugTabs } from '@hungpvq/react-shared-log';
import '@hungpvq/react-shared-log/style.css';

export function App() {
  useEffect(() => {
    installDebug();
    registerBuiltinDebugTabs();
  }, []);

  return (
    <div className="app-container">
      <MainContent />
      <DevtoolsShell />
    </div>
  );
}
```

---

## 2. Các Tab Tích hợp Sẵn (Built-in Tabs)

Mỗi tab đảm nhận một khía cạnh chẩn đoán của hệ thống:

| Tab ID | Tên hiển thị | Vai trò chẩn đoán |
| :--- | :--- | :--- |
| `store` | **Store** | Xem cây state toàn cục (`$_hungpv_store`), inspect từng key, lọc dữ liệu |
| `live` | **Live** | Theo dõi cây thực thi thời gian thực, đo lường độ trễ (latency/delta) từng bước |
| `logs` | **Logs** | Lọc theo level (debug, info, warn, error), namespace, flow request viewer |
| `errors` | **Errors** | Theo dõi lỗi runtime, lỗi unhandled window exception, copy error stack |
| `tabs` | **Tabs** | Quản lý danh sách tab, bật/tắt hiển thị từng tab theo nhu cầu |

---

## 3. Giao thức Đăng ký Tab "Pin-First" (Zero-Dependency)

### Tại sao sử dụng "Pin-First"?
Nếu bạn phát triển một thư viện độc lập (như `@hungpvq/draggable` hoặc `@hungpvq/map-core`), việc khai báo `@hungpvq/shared-log` trong `peerDependencies` sẽ làm phình to gói cài đặt của người dùng không cần tính năng debug.

Cơ chế **Pin-First** giải quyết vấn đề này bằng cách tận dụng biến toàn cục an toàn `globalThis.__hungpvqDebug`:
- Nếu `shared-log` đã cài đặt: Tab sẽ hiển thị trên Devtools.
- Nếu `shared-log` chưa cài đặt: Tab được lưu vào hàng đợi stub, không gây lỗi runtime.

### Mẫu Helper `ensure-debug-host.ts`:

Bạn chỉ cần sao chép helper sau vào thư viện/ứng dụng của mình:

```ts
export function ensureHungpvqDebugHost() {
  const g = globalThis as any;
  if (!g.__hungpvqDebug) {
    const queue: any[] = [];
    g.__hungpvqDebug = {
      registerTab: (tab: any) => queue.push(tab),
      __stubQueue: queue,
    };
  }
  return g.__hungpvqDebug;
}
```

### Đăng ký Tab tùy chỉnh:

```ts
import { ensureHungpvqDebugHost } from './ensure-debug-host';
import MyCustomMetricsPanel from './MyCustomMetricsPanel.vue';

ensureHungpvqDebugHost().registerTab({
  id: 'app:metrics',
  label: 'Metrics & Cache',
  order: 50,
  framework: 'vue',
  component: MyCustomMetricsPanel,
});
```

---

## 4. API Điều khiển Devtools Programmatically

Bạn có thể điều khiển trạng thái mở/đóng và chuyển tab bằng code:

```ts
import {
  setDebugOpen,
  toggleDebugOpen,
  openDebugTab,
  setDebugTabEnabled,
  listAllDebugTabs,
} from '@hungpvq/shared-log';

// Mở Devtools panel
setDebugOpen(true);

// Chuyển ngay đến tab 'logs'
openDebugTab('logs');

// Bật/tắt hiển thị tab 'app:metrics' trong menu
setDebugTabEnabled('app:metrics', false);

// Liệt kê toàn bộ tab đã đăng ký
const allTabs = listAllDebugTabs();
console.log('Registered tabs:', allTabs);
```

### Phím tắt F12 trong Console:
Khi `installDebug()` được gọi, bạn có thể gõ trực tiếp trong Devtools Console:
```js
window.__hungpvqDebug.help();
```
để xem toàn bộ lệnh thao tác nhanh trên cửa sổ console.
