import { installDevtoolsCore } from '@hungpvq/map-core/devtools';
import { installMapDebug, uninstallMapDebug } from '@hungpvq/map-debug';
import {
  installDatasetDebug,
  installDatasetDebugMenus,
  uninstallDatasetDebug,
} from '@hungpvq/map-debug/dataset';
import { devtoolLogAdapter } from './store';

let uninstallGlobalErrors: (() => void) | undefined;

/**
 * Bootstrap map devtools (log + map-debug + dataset F12 bridge).
 * Dataset bridge needs peer `@hungpvq/map-dataset` (optional in package.json;
 * apps without it should not mount the Dataset tab / import this package's install).
 */
export function installDevtools() {
  uninstallGlobalErrors?.();
  uninstallDatasetDebug();
  uninstallGlobalErrors = installDevtoolsCore(devtoolLogAdapter);
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
