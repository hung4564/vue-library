import { errorHandler } from '@hungpvq/map-core';
import { markMapDevtoolsInstalled } from '@hungpvq/map-debug';
import { installDatasetDebug } from '@hungpvq/map-debug/dataset';
import { registerBuiltinDebugTabs } from '@hungpvq/react-shared-log';
import {
  type DebugInstallOptions,
  installDebug,
  openDebugTab,
  reportDebugError,
  uninstallDebug,
} from '@hungpvq/shared-log';

import { registerDatasetDebugTab } from './register-dataset-tab';

let errorUnsub: (() => void) | undefined;
let datasetTabDispose: (() => void) | undefined;

export function installDevtools(options?: DebugInstallOptions): void {
  installDebug(options);
  registerBuiltinDebugTabs();
  markMapDevtoolsInstalled(true);
  errorUnsub?.();
  errorUnsub = errorHandler.onError((error) => {
    reportDebugError({
      code: error.code,
      message: error.message,
      context: error.context,
      stack: error.stack,
      recoverable: error.recoverable,
    });
  });
  try {
    installDatasetDebug();
    datasetTabDispose?.();
    datasetTabDispose = registerDatasetDebugTab();
  } catch {
    /* map-dataset optional */
  }
}

export function uninstallDevtools(): void {
  errorUnsub?.();
  errorUnsub = undefined;
  datasetTabDispose?.();
  datasetTabDispose = undefined;
  markMapDevtoolsInstalled(false);
  uninstallDebug();
}

export function openMapDevtoolsErrors(): void {
  openDebugTab('errors');
}
