import { LoggerFactory } from '@hungpvq/shared-log';
import { App, Plugin } from 'vue';
import { devtoolLogAdapter } from './store';
import Devtools from './ui/Devtools.vue';
const logger = LoggerFactory.getInstance();
export const DevtoolsPlugin: Plugin = {
  install(app: App) {
    logger.clearAdapters();
    logger.addAdapter(devtoolLogAdapter);
    logger.enableEverything();
    app.component('Devtools', Devtools);
  },
};
