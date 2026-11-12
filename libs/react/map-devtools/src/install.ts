import { errorHandler } from '@hungpvq/map-core';
import {
  addClearFunctionLog,
  getMapDebugStore,
  markMapDevtoolsInstalled,
} from '@hungpvq/map-debug';
import { registerBuiltinDebugTabs } from '@hungpvq/react-shared-log';
import {
  type DebugInstallOptions,
  installDebug,
  openDebugTab,
  reportDebugError,
  uninstallDebug,
} from '@hungpvq/shared-log';

import {
  clearDatasetDebug,
  initDatasetDebug,
  installDatasetDebugMenus,
} from '@hungpvq/map-debug/dataset';
import { registerDatasetDebugTab } from './register-dataset-tab';

export function installDevtools(options?: DebugInstallOptions): void {
  installDebug(options);
  registerBuiltinDebugTabs();
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
