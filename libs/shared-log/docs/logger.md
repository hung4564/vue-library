# Hướng dẫn Sử dụng Logger & Storage

Tài liệu này hướng dẫn chi tiết cách khởi tạo, ghi log có ngữ cảnh, cấu hình các Adapter đầu ra và tầng lưu trữ dữ liệu (DataStore) của `@hungpvq/shared-log`.

---

## 1. Khởi tạo Logger (`LoggerFactory`)

Mỗi module hoặc service nên sở hữu một Logger với `namespace` riêng biệt:

```ts
import { loggerFactory } from '@hungpvq/shared-log';

// Tạo hoặc lấy logger theo namespace
const logger = loggerFactory.getLogger('user:profile');
```

Hoặc cấu hình custom adapter cho logger:

```ts
import {
  LoggerFactory,
  ConsoleAdapter,
  DataStoreLogAdapter,
  MemoryLogDataStore,
} from '@hungpvq/shared-log';

const memoryStore = new MemoryLogDataStore({ limit: 5000 });
const customFactory = new LoggerFactory({
  adapters: [
    new ConsoleAdapter(),
    new DataStoreLogAdapter(memoryStore),
  ],
});

const myLogger = customFactory.getLogger('api:client');
```

---

## 2. Ghi Log có Ngữ cảnh (`.with()`)

Mỗi bản ghi log nên được gắn kèm thông tin hàm gọi (`fn`), giai đoạn/phân đoạn (`span`), và tùy chọn `actionId`:

```ts
// Ghi log info
logger
  .with({ fn: 'fetchUserData', span: 'network:request' })
  .info('Sending GET request to /api/user', { userId: '102' });

// Ghi log warning
logger
  .with({ fn: 'fetchUserData', span: 'cache:miss' })
  .warn('User profile not found in cache, fallback to remote API');

// Ghi log error kèm thông tin bổ sung
try {
  // ...
} catch (error) {
  logger
    .with({ fn: 'fetchUserData', span: 'network:error' })
    .error('Failed to retrieve user profile', { error, userId: '102' });
}
```

### Các thuộc tính trong `.with(...)`:
- `fn` *(string)*: Tên phương thức, hàm hoặc class chịu trách nhiệm.
- `span` *(string)*: Nhãn phân đoạn hoạt động (ví dụ: `auth:validate`, `db:query`, `render:mount`).
- `actionId` *(string, optional)*: Định danh chuỗi hành động để liên kết nhiều log trong cùng một transaction.
- `data` *(object, optional)*: Dữ liệu metadata bổ sung.

---

## 3. Các tầng Lưu trữ (`LogDataStore`)

Hệ thống tách biệt rõ ràng giữa việc hiển thị log ra màn hình console (`LogAdapter`) và việc lưu trữ/truy vấn log trong bộ nhớ hay cơ sở dữ liệu (`LogDataStore`):

| DataStore | Cơ chế | Sử dụng phù hợp |
| :--- | :--- | :--- |
| **`NoopLogDataStore`** | Bỏ qua, không lưu | Môi trường production thông thường chỉ cần stdout |
| **`MemoryLogDataStore`** | Lưu mảng in-memory vòng tròn (Ring buffer) | Môi trường test, Node.js worker, demo nhẹ |
| **`IndexedDBLogDataStore`** | Lưu trữ trên trình duyệt qua IndexedDB | Môi trường dev, Devtools Shell, debug sự cố người dùng |

### Truy vấn Log từ DataStore:

```ts
import { getLogDebugStore, resolveMaybePromise } from '@hungpvq/shared-log';

async function inspectRecentLogs() {
  const store = getLogDebugStore();
  
  // Lấy toàn bộ log
  const allLogs = await resolveMaybePromise(store.getAll());
  console.log(`Tổng số logs: ${allLogs.length}`);

  // Tìm kiếm có điều kiện
  const filtered = await resolveMaybePromise(
    store.list({
      namespace: 'user:profile',
      level: 'error',
      limit: 50,
    })
  );
  console.log('Các lỗi gần đây:', filtered);
}
```

---

## 4. Ngữ cảnh Môi trường động (`ZoneContextStorage`)

Khi xử lý các chuỗi thao tác phức tạp (chẳng hạn như một chuỗi thao tác map, hoặc transaction qua nhiều hàm bất đồng bộ), bạn có thể bọc ngữ cảnh bằng `runWithLogEvent`:

```ts
import { runWithLogEvent, loggerFactory } from '@hungpvq/shared-log';

const logger = loggerFactory.getLogger('order:process');

async function processOrder(orderId: string) {
  return runWithLogEvent({ actionId: `order_${orderId}`, fn: 'processOrder' }, async () => {
    // Mọi lời gọi logger bên trong block này sẽ tự động kế thừa actionId
    logger.info('Step 1: Validating cart');
    await validateCart();

    logger.info('Step 2: Processing payment');
    await chargePayment();

    logger.info('Step 3: Order completed successfully');
  });
}
```

---

## 5. Dọn dẹp & Quản lý Bộ nhớ

- **Xóa log chẩn đoán**:
  ```ts
  import { clearDebugLogs } from '@hungpvq/shared-log';

  // Xóa toàn bộ logs hiện hành trong store
  clearDebugLogs();
  ```
- **Tự động dọn dẹp khi đổi route**:
  ```ts
  import { setClearLogsOnNavigate, isClearLogsOnNavigate } from '@hungpvq/shared-log';

  // Bật tính năng tự xóa logs khi người dùng điều hướng trang
  setClearLogsOnNavigate(true);
  ```
