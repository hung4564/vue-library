import { installDevtoolsCore } from '@hungpvq/map-core/devtools';
import { installMapDebug, uninstallMapDebug } from '@hungpvq/map-debug';
import {
  installDatasetDebug,
  installDatasetDebugMenus,
  uninstallDatasetDebug,
} from '@hungpvq/map-debug/dataset';
import { devtoolLogAdapter } from './store';

let uninstallGlobalErrors: (() => void) | undefined;

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
