import { getDebugErrors, getDebugLogs } from '@hungpvq/shared-log';

import ErrorViewer from './ErrorViewer.vue';
import LiveHookViewer from './LiveHookViewer.vue';
import LogViewer from './LogViewer.vue';
import { registerDebugTab } from './register';
import StoreViewer from './StoreViewer.vue';

let registered = false;

/** Register built-in Vue tabs on the process pin. Idempotent. */
export function registerBuiltinDebugTabs(): void {
  if (registered) return;
  registered = true;
  registerDebugTab({
    id: 'store',
    label: 'Store',
    order: 1,
    component: StoreViewer,
  });
  registerDebugTab({
    id: 'live',
    label: 'Live',
    order: 2,
    component: LiveHookViewer,
  });
  registerDebugTab({
    id: 'logs',
    label: () => `Logs (${getDebugLogs().length})`,
    order: 98,
    badge: () => getDebugLogs().length,
    component: LogViewer,
  });
  registerDebugTab({
    id: 'errors',
    label: () => `Errors (${getDebugErrors().length})`,
    order: 99,
    badge: () => getDebugErrors().length,
    component: ErrorViewer,
  });
}
