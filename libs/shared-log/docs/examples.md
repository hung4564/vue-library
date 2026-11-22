# Các Ví dụ Thực tế (Practical Examples)

Trang này cung cấp các đoạn mã mẫu hoàn chỉnh cho các kịch bản sử dụng phổ biến nhất của `@hungpvq/shared-log`.

---

## 1. Ví dụ Vanilla TypeScript: Khởi tạo Logger & Lưu trữ

Sử dụng trong môi trường không framework hoặc Node.js / Worker:

```ts
import {
  LoggerFactory,
  ConsoleAdapter,
  DataStoreLogAdapter,
  MemoryLogDataStore,
  resolveMaybePromise,
} from '@hungpvq/shared-log';

// 1. Tạo DataStore in-memory lưu trữ tối đa 1.000 log
const logStore = new MemoryLogDataStore({ limit: 1000 });

// 2. Khởi tạo LoggerFactory với Console và Memory DataStore
const factory = new LoggerFactory({
  adapters: [
    new ConsoleAdapter(),
    new DataStoreLogAdapter(logStore),
  ],
});

// 3. Tạo Logger theo namespace
const logger = factory.getLogger('worker:geo-parser');

async function parseShapefile(buffer: ArrayBuffer) {
  logger.with({ fn: 'parseShapefile', span: 'init' }).info('Starting shapefile parsing', {
    byteLength: buffer.byteLength,
  });

  try {
    // Giả lập xử lý
    logger.with({ fn: 'parseShapefile', span: 'processing' }).debug('Processing layers');
    
    // ...
    logger.with({ fn: 'parseShapefile', span: 'done' }).info('Shapefile parsing completed');
  } catch (err) {
    logger.with({ fn: 'parseShapefile', span: 'error' }).error('Parsing failed', { error: err });
    throw err;
  }
}

// 4. Truy vấn lại log đã lưu
async function getRecentErrors() {
  const errors = await resolveMaybePromise(
    logStore.list({ level: 'error', limit: 10 })
  );
  return errors;
}
```

---

## 2. Ví dụ Vue 3: Toàn bộ Setup Ứng dụng & Devtools

### Bước 1: Khởi tạo trong `main.ts`

```ts
import { createApp } from 'vue';
import { installDebug } from '@hungpvq/shared-log';
import { registerBuiltinDebugTabs } from '@hungpvq/vue-shared-log';
import '@hungpvq/vue-shared-log/style.css';
import App from './App.vue';

// Kích hoạt debug và đăng ký tab mặc định
installDebug();
registerBuiltinDebugTabs();

const app = createApp(App);
app.mount('#app');
```

### Bước 2: Sử dụng Logger trong Service / Pinia Store

```ts
// src/services/auth.service.ts
import { loggerFactory } from '@hungpvq/shared-log';

const logger = loggerFactory.getLogger('auth:service');

export class AuthService {
  static async login(username: string) {
    const log = logger.with({ fn: 'login', span: 'auth:request' });
    log.info('User submitted login', { username });

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      log.info('Login successful');
      return await response.json();
    } catch (error) {
      log.error('Login failed', { error });
      throw error;
    }
  }
}
```

### Bước 3: Gắn DevtoolsShell và Custom Tab trong `App.vue`

```vue
<script setup lang="ts">
import { DevtoolsShell, registerDebugTab } from '@hungpvq/vue-shared-log';
import CustomCacheTab from './components/CustomCacheTab.vue';

// Đăng ký thêm tab chẩn đoán riêng của dự án
registerDebugTab({
  id: 'app:cache',
  label: 'Cache Inspector',
  order: 30,
  component: CustomCacheTab,
});
</script>

<template>
  <div id="layout">
    <main>
      <h1>My Vue Application</h1>
    </main>

    <!-- Devtools Shell hiển thị ở góc màn hình -->
    <DevtoolsShell />
  </div>
</template>
```

---

## 3. Ví dụ React 18: Setup Ứng dụng & `useLiveHookDebug`

### `src/App.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import { installDebug, loggerFactory } from '@hungpvq/shared-log';
import {
  DevtoolsShell,
  registerBuiltinDebugTabs,
  useLiveHookDebug,
} from '@hungpvq/react-shared-log';
import '@hungpvq/react-shared-log/style.css';

const logger = loggerFactory.getLogger('react:app');

export function App() {
  const [items, setItems] = useState<string[]>([]);
  const { trackAction } = useLiveHookDebug({
    namespace: 'items:manager',
    componentName: 'App',
  });

  useEffect(() => {
    installDebug();
    registerBuiltinDebugTabs();
  }, []);

  const handleAddItem = async () => {
    await trackAction('addItem', { currentCount: items.length }, async (ctx) => {
      logger.with({ fn: 'handleAddItem', span: 'state:update' }).info('Adding new item');
      
      ctx.step('generating:id');
      const newItem = `Item_${Date.now()}`;
      
      setItems((prev) => [...prev, newItem]);
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>React Shared-Log Demo</h2>
      <button onClick={handleAddItem}>Thêm Phần Tử</button>
      <ul>
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>

      {/* Devtools panel */}
      <DevtoolsShell />
    </div>
  );
}
```

---

## 4. Quản lý Lỗi & Exception Tracking (`reportDebugError`)

Bắt lỗi unhandled hoặc gửi lỗi nghiệp vụ trực tiếp vào tab **Errors** của Devtools:

```ts
import {
  reportDebugError,
  installWindowErrorCapture,
} from '@hungpvq/shared-log';

// 1. Tự động lắng nghe window.onerror và window.onunhandledrejection
installWindowErrorCapture();

// 2. Hoặc gửi lỗi thủ công từ try/catch:
try {
  executeCriticalBusinessLogic();
} catch (err: any) {
  reportDebugError({
    message: err.message ?? 'Unknown business error',
    source: 'payment-processor',
    error: err,
    stack: err.stack,
    time: Date.now(),
  });
}
```
Mọi lỗi được báo cáo sẽ lập tức hiển thị kèm badge thông báo đỏ trên tab Errors của Devtools Shell, cho phép xem stack trace và copy JSON một cú nhấp chuột.
