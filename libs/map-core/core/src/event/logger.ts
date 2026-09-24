import { loggerFactory } from '@hungpvq/shared-log';

import { MAP_STORE_KEY } from '../types/constants';

export const logger = loggerFactory
  .createLogger()
  .setNamespace('map:' + MAP_STORE_KEY.EVENT, 2);
