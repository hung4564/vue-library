import { ConsoleAdapter, type LogAdapter, LoggerFactory } from '../core';
import { ensureHungpvqDebugHost } from './host';
import { installWindowErrorCapture } from './error-bus';
import { installNavigateLogClear } from './navigate-clear';
import {
  addDebugCleanup,
  configureDebugLogStore,
  createDebugLogAdapter,
  type DebugInstallOptions,
  getLogDebugStore,
  runDebugCleanup,
  setClearLogsOnNavigate,
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
  log
    .with({ fn: 'installDebug', span: 'init' })
    .debug('shared-log debug installed');
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
  if (options?.clearOnNavigate !== undefined) {
    setClearLogsOnNavigate(options.clearOnNavigate);
  }
  runDebugCleanup();
  addDebugCleanup(installDebugCore(createDebugLogAdapter()));
  addDebugCleanup(installNavigateLogClear());
}

export function uninstallDebug(): void {
  runDebugCleanup();
  const bag = getLogDebugStore();
  const debugAdapter = bag.logAdapter;
  bag.logAdapter = undefined;
  const factory = LoggerFactory.getInstance();
  const remaining = factory
    .getAdapters()
    .filter((adapter) => adapter !== debugAdapter);
  factory.clearAdapters();
  if (!remaining.some((adapter) => adapter instanceof ConsoleAdapter)) {
    remaining.unshift(new ConsoleAdapter());
  }
  for (const adapter of remaining) factory.addAdapter(adapter);
  if (bag.logDataStore) {
    factory.setDataStore(bag.logDataStore);
  }
}
