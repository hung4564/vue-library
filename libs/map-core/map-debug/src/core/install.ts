import { errorHandler, installGlobalErrorCapture } from '@hungpvq/map-core';
import {
  ConsoleAdapter,
  type LogAdapter,
  LoggerFactory,
} from '@hungpvq/shared-log';
import { getMapDebugStore } from './map-debug-store';
import {
  addClearFunctionLog,
  clearFunctionLog,
  configureDevtoolLogStore,
  createDevtoolLogAdapter,
  DevtoolsInstallOptions,
  installDevtoolErrorListener,
} from './store-core';

/** True after `installDevtoolsCore` until its disposer runs. */
export function isMapDevtoolsInstalled(): boolean {
  return getMapDebugStore().installed;
}

/**
 * Shared devtools bootstrap: console + devtool log adapters and global error capture.
 * Framework packages keep `installDevtools` / `uninstallDevtools` lifecycle thin.
 */
export function installDevtoolsCore(devtoolLogAdapter: LogAdapter): () => void {
  const logger = LoggerFactory.getInstance();
  logger.clearAdapters();
  logger.addAdapter(new ConsoleAdapter());
  logger.addAdapter(devtoolLogAdapter);
  getMapDebugStore().installed = true;
  const log = logger.createLogger().setNamespace('map-debug');
  log
    .with({ fn: 'installMapDebug', span: 'init' })
    .debug('map-debug installed');
  const uninstallCapture = installGlobalErrorCapture(errorHandler);
  return () => {
    log
      .with({ fn: 'uninstallMapDebug', span: 'cleanup' })
      .debug('map-debug uninstalled');
    uninstallCapture();
    getMapDebugStore().installed = false;
  };
}

export function installDevtools(options?: DevtoolsInstallOptions) {
  if (options?.logStore !== undefined) {
    configureDevtoolLogStore(options.logStore);
  }
  clearFunctionLog();
  addClearFunctionLog(installDevtoolsCore(createDevtoolLogAdapter()));
  addClearFunctionLog(installDevtoolErrorListener());
}

export function uninstallDevtools() {
  clearFunctionLog();
}
