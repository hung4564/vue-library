import {
  configureDevtoolLogStore,
  createDevtoolLogAdapter,
  installDevtoolsCore,
  type DevtoolLogStoreConfig,
} from '@hungpvq/map-core/devtools';
import { installMapDebug, uninstallMapDebug } from '@hungpvq/map-debug';
import {
  installDatasetDebug,
  installDatasetDebugMenus,
  uninstallDatasetDebug,
} from '@hungpvq/map-debug/dataset';

let uninstallGlobalErrors: (() => void) | undefined;

export type DevtoolsInstallOptions = {
  /**
   * Log store for Devtools Logs.
   * Default: `'indexeddb'` (uncapped).
   * Pass `'memory'`, `{ kind: 'memory', limit }`, a custom {@link import('@hungpvq/shared-log').LogDataStore},
   * or call `configureDevtoolLogStore` first.
   */
  logStore?: DevtoolLogStoreConfig;
};

export function installDevtools(options?: DevtoolsInstallOptions) {
  if (options?.logStore !== undefined) {
    configureDevtoolLogStore(options.logStore);
  }
  uninstallGlobalErrors?.();
  uninstallDatasetDebug();
  uninstallGlobalErrors = installDevtoolsCore(createDevtoolLogAdapter());
  installMapDebug();
  installDatasetDebug();
  // Ensure global layer/item Debug menus (idempotent; also hooked from dataset barrel).
  installDatasetDebugMenus();
}

export function uninstallDevtools() {
  uninstallDatasetDebug();
  uninstallMapDebug();
  uninstallGlobalErrors?.();
  uninstallGlobalErrors = undefined;
}
