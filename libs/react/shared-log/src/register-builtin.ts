import { getDebugErrors, getDebugLogs } from '@hungpvq/shared-log';

import { ErrorViewer } from './ErrorViewer';
import { LiveHookViewer } from './LiveHookViewer';
import { LogViewer } from './LogViewer';
import { registerDebugTab } from './register';
import { StoreViewer } from './StoreViewer';

let registered = false;

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
