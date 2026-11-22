# Stable API Allowlist (`shared-log`)

Tài liệu này xác định danh sách các API ổn định (Stable API Surface) và các cam kết về SemVer của nhóm thư viện `@hungpvq/shared-log`.

---

## 1. Nguyên tắc SemVer

- **Major (X.0.0)**: Thay đổi phá vỡ tương thích ngược (breaking changes) về chữ ký hàm, đổi tên export, thay đổi cấu trúc `DebugRecord`, hoặc nâng yêu cầu phiên bản Node / framework tối thiểu.
- **Minor (1.X.0)**: Bổ sung thêm API mới, thêm phương thức trên Logger hoặc thêm adapter/tab mà không phá vỡ tính tương thích cũ.
- **Patch (1.0.X)**: Sửa lỗi bên trong implementation, tối ưu hiệu năng hoặc sửa tài liệu.

> [!IMPORTANT]
> Toàn bộ các export từ root barrel của cả 3 package đều được khóa chặt chẽ bằng các bài test `src/public-api.spec.ts`. Bất kỳ sự thay đổi ngoài ý muốn nào trên runtime surface sẽ làm fail unit test ngay lập tức.

---

## 2. `@hungpvq/shared-log` (Core Runtime Surface)

Khóa bởi: `libs/shared-log/core/src/public-api.spec.ts`

### Các Class & Factory chính:
- `Logger`: Lớp ghi log chính, cung cấp `.with(...)`, `.log()`, `.info()`, `.warn()`, `.error()`, `.debug()`.
- `LoggerFactory`: Factory quản lý việc khởi tạo Logger và gắn adapter.
- `loggerFactory`: Instance singleton mặc định của `LoggerFactory`.
- `NoopLogDataStore`: DataStore rỗng, không lưu trữ.
- `MemoryLogDataStore`: DataStore in-memory dạng ring buffer.
- `IndexedDBLogDataStore`: DataStore lưu trữ bền vững trên IndexedDB.
- `BaseLogDataStore`: Lớp cơ sở để tạo custom store.
- `ConsoleAdapter`: Adapter xuất log ra console trình duyệt / terminal.
- `DataStoreLogAdapter`: Adapter ghi log vào một `LogDataStore`.

### Các hàm Debug Host & Lifecycle:
- `installDebug`, `installDebugCore`, `uninstallDebug`, `isDebugInstalled`
- `ensureHungpvqDebugHost`, `peekHungpvqDebugHost`
- `openDebugTab`, `toggleDebugTab`, `setDebugActiveTab`, `setDebugOpen`, `toggleDebugOpen`, `setDebugTabEnabled`, `isDebugTabEnabled`, `listAllDebugTabs`
- `getLogDebugStore`, `getDebugLogDataStore`, `configureDebugLogStore`
- `getDebugLogs`, `clearDebugLogs`, `replaceDebugLogs`, `refreshDebugLogsFromStore`
- `reportDebugError`, `getDebugErrors`, `clearDebugErrors`, `installWindowErrorCapture`
- `trackLiveEventAction`, `getLiveTraceEvents`, `clearLiveTraceEvents`, `subscribeLiveTrace`
- `setClearLogsOnNavigate`, `isClearLogsOnNavigate`

---

## 3. `@hungpvq/vue-shared-log` (Vue 3 Surface)

Khóa bởi: `libs/shared-log/vue/src/public-api.spec.ts`

### Components & UI:
- `DevtoolsShell`: Component shell chính hiển thị Devtools panel trên Vue.
- `DevtoolPanelContainer`, `DevtoolPanelCard`, `DevtoolPanelToolbar`, `DevtoolPanelSplit`: Các layout block component dùng để xây dựng custom debug tabs.
- `PanelTabManager`: Quản lý danh sách và trạng thái các tab.
- `TreeItem`: Hiển thị cây dữ liệu dạng JSON/Tree.

### Composables & Functions:
- `useLiveHookDebug`: Composable theo dõi tiến trình thực thi hành động trong Vue.
- `useDebugHost`: Composable truy cập trạng thái Debug Host.
- `registerDebugTab`: Đăng ký custom tab vào hệ thống.
- `registerBuiltinDebugTabs`: Đăng ký toàn bộ tab mặc định (Store, Live, Logs, Errors, Tabs).
- `resolveBuiltinDebugTabs`, `BUILTIN_DEBUG_TAB_MAP`, `DEFAULT_BUILTIN_DEBUG_TABS`

---

## 4. `@hungpvq/react-shared-log` (React 18 Surface)

Khóa bởi: `libs/shared-log/react/src/public-api.spec.ts`

### Components & UI:
- `Devtools`, `DevtoolsShell`: Component shell chính hiển thị Devtools panel trên React.
- `DevtoolPanelContainer`, `DevtoolPanelCard`, `DevtoolPanelToolbar`, `DevtoolPanelSplit`: Các layout block component cho React.
- `PanelTabManager`: Quản lý danh sách và trạng thái các tab.
- `TreeItem`: Hiển thị cây dữ liệu dạng JSON/Tree.
- `LiveHookScope`: Context provider để gom nhóm scope cho Live Hook.

### Hooks & Functions:
- `useLiveHookDebug`: Hook theo dõi tiến trình thực thi hành động trong React.
- `useDebugHost`: Hook truy cập trạng thái Debug Host.
- `registerDebugTab`: Đăng ký custom tab vào hệ thống.
- `registerBuiltinDebugTabs`: Đăng ký toàn bộ tab mặc định.
- `resolveBuiltinDebugTabs`, `BUILTIN_DEBUG_TAB_MAP`, `DEFAULT_BUILTIN_DEBUG_TABS`
