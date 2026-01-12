import { loggerFactory } from '@hungpvq/shared-log';
import { MAP_STORE_KEY } from '@hungpvq/map-core';
export const logger = loggerFactory
  .createLogger()
  .setNamespace('map:' + MAP_STORE_KEY.CRS, 2);
