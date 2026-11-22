# Shared Log Libraries (`@hungpvq/*shared-log`)

Hệ thống ghi log có cấu trúc (Structured Logging), theo dõi luồng thời gian thực (Live Tracing) và công cụ Devtools đa nền tảng cho Vanilla TypeScript, Vue 3 và React 18.

| Package | Thư mục | Mô tả |
| :--- | :--- | :--- |
| [`@hungpvq/shared-log`](./core/) | `core/` | Core logger, ambient zone context, data stores, debug host |
| [`@hungpvq/vue-shared-log`](./vue/) | `vue/` | Vue 3 Devtools shell, built-in tabs, `useLiveHookDebug` |
| [`@hungpvq/react-shared-log`](./react/) | `react/` | React 18 Devtools shell, built-in tabs, `useLiveHookDebug`, `LiveHookScope` |

**Tài liệu chi tiết:**
- [Docs Hub](./docs/index.md) — Tổng quan kiến trúc & cài đặt
- [Logger & Storage](./docs/logger.md) — Hướng dẫn ghi log, context `.with()`, Memory & IndexedDB store
- [Live Hook Tracing](./docs/live-hook.md) — Theo dõi tiến trình hành động thời gian thực
- [Devtools Shell](./docs/devtools.md) — Bảng điều khiển Devtools, đăng ký custom tabs qua pin-first
- [Ví dụ thực tế](./docs/examples.md) — Code mẫu hoàn chỉnh cho Vanilla, Vue và React
- [Stable API](./docs/stable-api.md) — Danh sách API ổn định và cam kết SemVer

---

## Cài đặt nhanh

::: code-group
```bash [Vue 3]
npm install @hungpvq/shared-log @hungpvq/vue-shared-log
```

```bash [React 18]
npm install @hungpvq/shared-log @hungpvq/react-shared-log
```

```bash [Vanilla]
npm install @hungpvq/shared-log
```
:::

## Khởi tạo cơ bản

```ts
import { installDebug, loggerFactory } from '@hungpvq/shared-log';

// Kích hoạt debug
installDebug();

// Ghi log có ngữ cảnh
const logger = loggerFactory.getLogger('app:service');
logger.with({ fn: 'init', span: 'app:start' }).info('Application started successfully');
```
