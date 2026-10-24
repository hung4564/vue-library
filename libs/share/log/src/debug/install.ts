import { ConsoleAdapter, type LogAdapter, LoggerFactory } from '../core';
import { ensureHungpvqDebugHost } from './host';
import { installWindowErrorCapture } from './error-bus';
import {
  addDebugCleanup,
  configureDebugLogStore,
  createDebugLogAdapter,
  type DebugInstallOptions,
  getLogDebugStore,
  runDebugCleanup,
} from './store';

export function isDebugInstalled(): boolean {
  return getLogDebugStore().installed;
}

export function installDebugCore(devtoolLogAdapter: LogAdapter): () => void {
  const logger = LoggerFactory.getInstance();
  logger.clearAdapters();
  logger.addAdapter(new ConsoleAdapter());
  logger.addAdapter(devtoolLogAdapter);
  getLogDebugStore().installed = true;
  ensureHungpvqDebugHost();
  const log = logger.createLogger().setNamespace('shared-log:debug');
  log.with({ fn: 'installDebug', span: 'init' }).debug('shared-log debug installed');
  const uninstallCapture = installWindowErrorCapture();
  return () => {
    log
      .with({ fn: 'uninstallDebug', span: 'cleanup' })
      .debug('shared-log debug uninstalled');
    uninstallCapture();
    getLogDebugStore().installed = false;
  };
}

export function installDebug(options?: DebugInstallOptions): void {
  if (options?.logStore !== undefined) {
    configureDebugLogStore(options.logStore);
  }
  runDebugCleanup();
  addDebugCleanup(installDebugCore(createDebugLogAdapter()));
}

export function uninstallDebug(): void {
  runDebugCleanup();
}
