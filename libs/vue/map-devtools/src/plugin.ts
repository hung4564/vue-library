import { installGlobalErrorCapture } from '@hungpvq/map-core';
import { ConsoleAdapter, LoggerFactory } from '@hungpvq/shared-log';
import { errorHandler } from '@hungpvq/vue-map-core';
import { App, Plugin } from 'vue';
import { devtoolLogAdapter } from './store';
import Devtools from './ui/Devtools.vue';

const logger = LoggerFactory.getInstance();
let uninstallGlobalErrors: (() => void) | undefined;

export const DevtoolsPlugin: Plugin = {
  install(app: App) {
    logger.clearAdapters();
    logger.addAdapter(new ConsoleAdapter());
    logger.addAdapter(devtoolLogAdapter);
    // logger.enableEverything();
    uninstallGlobalErrors?.();
    uninstallGlobalErrors = installGlobalErrorCapture(errorHandler);
    app.component('Devtools', Devtools);
  },
};

export function uninstallDevtools() {
  uninstallGlobalErrors?.();
  uninstallGlobalErrors = undefined;
}
