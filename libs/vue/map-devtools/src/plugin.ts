import {
  configureDevtoolLogStore,
  createDevtoolLogAdapter,
  type DevtoolLogStoreConfig,
  installDevtoolsCore,
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

/**
 * Bootstrap map devtools (log + map-debug + dataset F12 bridge).
 * Dataset bridge needs peer `@hungpvq/map-dataset` (optional in package.json;
 * apps without it should not mount the Dataset tab / import this package's install).
 */
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
