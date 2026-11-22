import {
  addDebugCleanup,
  getDebugErrors,
  getDebugLogs,
} from '@hungpvq/shared-log';

import { ErrorViewer, PanelErrorViewer } from './panels/PanelErrorViewer';
import { LiveHookViewer, PanelLiveHookViewer } from './panels/PanelLiveHookViewer';
import { LogViewer, PanelLogViewer } from './panels/PanelLogViewer';
import { PanelStoreViewer, StoreViewer } from './panels/PanelStoreViewer';
import { PanelTabManager } from './panels/PanelTabManager';
import { registerDebugTab } from './register';
import { ensureReactLogUiStore } from './store';

export type DebugTabRegistrar = () => (() => void) | void;
export type BuiltinDebugTabId = 'store' | 'live' | 'logs' | 'errors' | 'tabs';

export function registerStoreDebugTab(): () => void {
  return registerDebugTab({
    id: 'store',
    label: 'Store',
    order: 1,
    component: StoreViewer,
  });
}

export function registerLiveDebugTab(): () => void {
  return registerDebugTab({
    id: 'live',
    label: 'Live',
    order: 2,
    component: LiveHookViewer,
  });
}

export function registerLogsDebugTab(): () => void {
  return registerDebugTab({
    id: 'logs',
    label: () => `Logs (${getDebugLogs().length})`,
    order: 98,
    badge: () => getDebugLogs().length,
    component: LogViewer,
  });
}

export function registerErrorsDebugTab(): () => void {
  return registerDebugTab({
    id: 'errors',
    label: () => `Errors (${getDebugErrors().length})`,
    order: 99,
    badge: () => getDebugErrors().length,
    component: ErrorViewer,
  });
}

export function registerTabsDebugTab(): () => void {
  return registerDebugTab({
    id: 'tabs',
    label: 'Tabs',
    order: 100,
    component: PanelTabManager,
  });
}

export const BUILTIN_DEBUG_TAB_MAP: Record<
  BuiltinDebugTabId,
  DebugTabRegistrar
> = {
  store: registerStoreDebugTab,
  live: registerLiveDebugTab,
  logs: registerLogsDebugTab,
  errors: registerErrorsDebugTab,
  tabs: registerTabsDebugTab,
};

export const DEFAULT_BUILTIN_DEBUG_TABS: readonly DebugTabRegistrar[] = [
  registerStoreDebugTab,
  registerLiveDebugTab,
  registerLogsDebugTab,
  registerErrorsDebugTab,
  registerTabsDebugTab,
] as const;

export type DebugTabItem =
  | DebugTabRegistrar
  | BuiltinDebugTabId
  | (string & {});

export type DebugTabsConfig =
  | readonly DebugTabItem[]
  | Partial<Record<BuiltinDebugTabId | string, boolean>>;

export function resolveBuiltinDebugTabs(
  config?: DebugTabsConfig,
): DebugTabRegistrar[] {
  if (!config) {
    return [...DEFAULT_BUILTIN_DEBUG_TABS];
  }
  if (Array.isArray(config)) {
    const registrars: DebugTabRegistrar[] = [];
    for (const item of config) {
      if (typeof item === 'function') {
        registrars.push(item);
      } else if (typeof item === 'string') {
        const registrar = (
          BUILTIN_DEBUG_TAB_MAP as Record<string, DebugTabRegistrar | undefined>
        )[item];
        if (registrar) {
          registrars.push(registrar);
        }
      }
    }
    return registrars;
  }
  if (typeof config === 'object') {
    const registrars: DebugTabRegistrar[] = [];
    const ids: BuiltinDebugTabId[] = ['store', 'live', 'logs', 'errors', 'tabs'];
    for (const id of ids) {
      if ((config as Record<string, boolean>)[id] !== false) {
        registrars.push(BUILTIN_DEBUG_TAB_MAP[id]);
      }
    }
    return registrars;
  }
  return [...DEFAULT_BUILTIN_DEBUG_TABS];
}

export function registerBuiltinDebugTabs(
  tabs?: DebugTabsConfig,
): () => void {
  const ui = ensureReactLogUiStore();
  if (ui.builtinRegistered) return () => {};
  ui.builtinRegistered = true;
  const registrars = resolveBuiltinDebugTabs(tabs);
  const unsubs: Array<() => void> = [];
  for (const registerTab of registrars) {
    const unsub = registerTab();
    if (typeof unsub === 'function') {
      unsubs.push(unsub);
    }
  }
  const cleanup = () => {
    for (const unsub of unsubs) unsub();
    ui.builtinRegistered = false;
  };
  addDebugCleanup(cleanup);
  return cleanup;
}
