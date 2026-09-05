import { loggerFactory } from '@hungpvq/shared-log';
export const logger = loggerFactory
  .createLogger()
  .setNamespace('map:basemap', 2);
