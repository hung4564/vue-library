import { errorHandler, installGlobalErrorCapture } from '@hungpvq/map-core';
import { ConsoleAdapter, LoggerFactory } from '@hungpvq/shared-log';
import type { App, Plugin } from 'vue';
import { devtoolLogAdapter } from './store';
import Devtools from './ui/Devtools.vue';

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

/**
 * @deprecated Prefer {@link installDevtools} + mount `<Devtools />` (React parity).
 * Still registers a global `Devtools` component for older apps.
 */
export const DevtoolsPlugin: Plugin = {
  install(app: App) {
    installDevtools();
    app.component('Devtools', Devtools);
  },
};
