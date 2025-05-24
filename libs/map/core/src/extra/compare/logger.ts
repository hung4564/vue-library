import { loggerFactory } from '@hungpvq/shared-log';
import { MAP_STORE_KEY } from '../../types/key';
export const logger = loggerFactory
  .createLogger()
  .setNamespace('map:' + MAP_STORE_KEY.MAP_COMPARE, 2);
