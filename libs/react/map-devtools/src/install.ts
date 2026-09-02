import { installGlobalErrorCapture } from '@hungpvq/map-core';
import { errorHandler } from '@hungpvq/react-map-core';
import { ConsoleAdapter, LoggerFactory } from '@hungpvq/shared-log';
import { devtoolLogAdapter } from './store';

let uninstallGlobalErrors: (() => void) | undefined;

export function installDevtools() {
  const logger = LoggerFactory.getInstance();
  logger.clearAdapters();
  logger.addAdapter(new ConsoleAdapter());
  logger.addAdapter(devtoolLogAdapter);
  // logger.enableEverything();
  uninstallGlobalErrors?.();
  uninstallGlobalErrors = installGlobalErrorCapture(errorHandler);
}

export function uninstallDevtools() {
  uninstallGlobalErrors?.();
  uninstallGlobalErrors = undefined;
}
