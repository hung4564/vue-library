import { MAP_STORE_KEY } from '../types/constants';
import { loggerFactory } from '@hungpvq/shared-log';

export const logger = loggerFactory
  .createLogger()
  .setNamespace('map:' + MAP_STORE_KEY.TOOLBAR, 2);
