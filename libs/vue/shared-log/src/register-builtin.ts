import {
  addDebugCleanup,
  getDebugErrors,
  getDebugLogs,
} from '@hungpvq/shared-log';

import ErrorViewer from './PanelErrorViewer.vue';
import LiveHookViewer from './PanelLiveHookViewer.vue';
import LogViewer from './PanelLogViewer.vue';
import StoreViewer from './PanelStoreViewer.vue';
import { registerDebugTab } from './register';
import { useVueLogUiStore } from './store';

/** Register built-in Vue tabs on the process pin. Idempotent. */
export function registerBuiltinDebugTabs(): void {
  const ui = useVueLogUiStore();
  if (ui.builtinRegistered.value) return;
  ui.builtinRegistered.value = true;
  const unsubs = [
    registerDebugTab({
      id: 'store',
      label: 'Store',
      order: 1,
      component: StoreViewer,
    }),
    registerDebugTab({
      id: 'live',
      label: 'Live',
      order: 2,
      component: LiveHookViewer,
    }),
    registerDebugTab({
      id: 'logs',
      label: () => `Logs (${getDebugLogs().length})`,
      order: 98,
      badge: () => getDebugLogs().length,
      component: LogViewer,
    }),
    registerDebugTab({
      id: 'errors',
      label: () => `Errors (${getDebugErrors().length})`,
      order: 99,
      badge: () => getDebugErrors().length,
      component: ErrorViewer,
    }),
  ];
  addDebugCleanup(() => {
    for (const unsub of unsubs) unsub();
    ui.builtinRegistered.value = false;
  });
}
