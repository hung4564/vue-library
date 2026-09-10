import { errorHandler, installGlobalErrorCapture } from '@hungpvq/map-core';
import { ConsoleAdapter, LoggerFactory } from '@hungpvq/shared-log';
import { devtoolLogAdapter } from './store';

let uninstallGlobalErrors: (() => void) | undefined;

/**
 * Bootstrap map devtools (log adapter + global error capture).
 * Same contract as `@hungpvq/react-map-devtools` `installDevtools`.
 * Mount `<Devtools />` explicitly (import from this package).
 */
export function installDevtools() {
  const logger = LoggerFactory.getInstance();
  logger.clearAdapters();
  logger.addAdapter(new ConsoleAdapter());
  logger.addAdapter(devtoolLogAdapter);
  uninstallGlobalErrors?.();
  uninstallGlobalErrors = installGlobalErrorCapture(errorHandler);
}

export function uninstallDevtools() {
  uninstallGlobalErrors?.();
  uninstallGlobalErrors = undefined;
}
