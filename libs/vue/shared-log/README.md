# @hungpvq/vue-shared-log

Vue Devtools shell for `@hungpvq/shared-log`: Store, Live, Logs, Errors.

```ts
import { installDebug } from '@hungpvq/shared-log';
import { Devtools, registerDebugTab } from '@hungpvq/vue-shared-log';
import '@hungpvq/vue-shared-log/style.css';

installDebug();
```

Register extra tabs (or use `globalThis.__hungpvqDebug` without importing this package):

```ts
registerDebugTab({
  id: 'app:demo',
  label: 'Demo',
  order: 20,
  component: DemoTab,
});
```
