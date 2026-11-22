# @hungpvq/react-shared-log

React Devtools shell for `@hungpvq/shared-log`: Store, Live, Logs, Errors, plus `useLiveHookDebug` / `LiveHookScope`. Logs and Live share `{ id, header, data }`. Style: `@hungpvq/shared-log/style.css` (re-exported).

```ts
import { installDebug } from '@hungpvq/shared-log';
import { Devtools, registerDebugTab } from '@hungpvq/react-shared-log';
import '@hungpvq/react-shared-log/style.css';

installDebug();
```
