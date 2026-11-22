import { errorHandler } from '@hungpvq/map-core';
import {
  addClearFunctionLog,
  getMapDebugStore,
  markMapDevtoolsInstalled,
} from '@hungpvq/map-debug';
import {
  clearDatasetDebug,
  initDatasetDebug,
  installDatasetDebugMenus,
} from '@hungpvq/map-debug/dataset';
import { registerDragDebugTab } from '@hungpvq/react-draggable';
import {
  BUILTIN_DEBUG_TAB_MAP,
  type BuiltinDebugTabId,
  type DebugTabRegistrar,
  registerBuiltinDebugTabs,
} from '@hungpvq/react-shared-log';
import {
  type DebugInstallOptions,
  installDebug,
  reportDebugError,
  uninstallDebug,
} from '@hungpvq/shared-log';
import { registerDatasetDebugTab } from './register-dataset-tab';

export type MapDevtoolsTabId =
  | BuiltinDebugTabId
  | 'draggable'
  | 'dataset'
  | (string & {});

export const MAP_DEVTOOLS_KNOWN_TABS: Record<string, DebugTabRegistrar> = {
  ...BUILTIN_DEBUG_TAB_MAP,
  draggable: registerDragDebugTab,
  dataset: registerDatasetDebugTab,
};

export type DevtoolsTabItem =
  | DebugTabRegistrar
  | MapDevtoolsTabId;

export type DevtoolsTabConfig =
  | readonly DevtoolsTabItem[]
  | Partial<Record<MapDevtoolsTabId | string, boolean>>;

export type DevtoolsInstallOptions = DebugInstallOptions & {
  tabs?: DevtoolsTabConfig;
  disabledTabs?: readonly string[];
  enabledTabs?: readonly string[];
};

export function resolveMapDevtoolsTabs(
  options?: DevtoolsInstallOptions,
): DebugTabRegistrar[] {
  const disabledSet = new Set<string>(options?.disabledTabs ?? []);
  const enabledSet = options?.enabledTabs
    ? new Set<string>(options.enabledTabs)
    : undefined;

  let candidates: Array<{ id?: string; registrar: DebugTabRegistrar }>;

  if (Array.isArray(options?.tabs)) {
    candidates = [];
    for (const item of options.tabs) {
      if (typeof item === 'function') {
        candidates.push({ registrar: item });
      } else if (typeof item === 'string') {
        const registrar = (
          MAP_DEVTOOLS_KNOWN_TABS as Record<string, DebugTabRegistrar | undefined>
        )[item];
        if (registrar) {
          candidates.push({ id: item, registrar });
        }
      }
    }
  } else if (options?.tabs && typeof options.tabs === 'object') {
    const config = options.tabs as Record<string, boolean>;
    candidates = [
      { id: 'store', registrar: MAP_DEVTOOLS_KNOWN_TABS.store },
      { id: 'live', registrar: MAP_DEVTOOLS_KNOWN_TABS.live },
      { id: 'logs', registrar: MAP_DEVTOOLS_KNOWN_TABS.logs },
      { id: 'errors', registrar: MAP_DEVTOOLS_KNOWN_TABS.errors },
      { id: 'tabs', registrar: MAP_DEVTOOLS_KNOWN_TABS.tabs },
    ];
    for (const [id, registrar] of Object.entries(MAP_DEVTOOLS_KNOWN_TABS)) {
      if (config[id] === true && !candidates.some((c) => c.id === id)) {
        candidates.push({ id, registrar });
      }
    }
    candidates = candidates.filter((c) => !c.id || config[c.id] !== false);
  } else {
    candidates = [
      { id: 'store', registrar: MAP_DEVTOOLS_KNOWN_TABS.store },
      { id: 'live', registrar: MAP_DEVTOOLS_KNOWN_TABS.live },
      { id: 'logs', registrar: MAP_DEVTOOLS_KNOWN_TABS.logs },
      { id: 'errors', registrar: MAP_DEVTOOLS_KNOWN_TABS.errors },
      { id: 'tabs', registrar: MAP_DEVTOOLS_KNOWN_TABS.tabs },
    ];
  }

  return candidates
    .filter((c) => {
      if (!c.id) return true;
      if (disabledSet.has(c.id)) return false;
      if (enabledSet && !enabledSet.has(c.id)) return false;
      return true;
    })
    .map((c) => c.registrar);
}

export function installDevtools(options?: DevtoolsInstallOptions): void {
  installDebug(options);
  const registrars = resolveMapDevtoolsTabs(options);
  registerBuiltinDebugTabs(registrars);
  markMapDevtoolsInstalled(true);
  const bag = getMapDebugStore();
  bag.errorUnsub?.();
  bag.errorUnsub = errorHandler.onError((error) => {
    reportDebugError({
      code: error.code,
      message: error.message,
      context: error.context,
      stack: error.stack,
      recoverable: error.recoverable,
    });
  });
}

export function uninstallDevtools(): void {
  const bag = getMapDebugStore();
  bag.errorUnsub?.();
  bag.errorUnsub = undefined;
  markMapDevtoolsInstalled(false);
  uninstallDebug();
}

export function installDatasetDebug() {
  initDatasetDebug();
  addClearFunctionLog(installDatasetDebugMenus());
  addClearFunctionLog(clearDatasetDebug);
  addClearFunctionLog(registerDatasetDebugTab());
}
