# @hungpvq/react-shared-log

React Devtools shell for `@hungpvq/shared-log`: Store, Live, Logs, Errors, plus `useLiveHookDebug` / `LiveHookScope`. Logs and Live share `{ id, header, data }`. Style: `@hungpvq/shared-log/style.css` (re-exported).

**Documentation:** [Docs Hub](../docs/index.md) · [Devtools Shell](../docs/devtools.md) · [Live Hook](../docs/live-hook.md) · [Examples](../docs/examples.md)

```ts
import { installDebug } from '@hungpvq/shared-log';
import { Devtools, registerDebugTab } from '@hungpvq/react-shared-log';
import '@hungpvq/react-shared-log/style.css';

installDebug();
```
