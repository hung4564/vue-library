import { loggerFactory } from '@hungpvq/shared-log';

import { MAP_STORE_KEY } from './constants';

/** Domain logger for map language / locale store (`map:lang`). */
export const mapLangLogger = loggerFactory
  .createLogger()
  .setNamespace('map:' + MAP_STORE_KEY.LANG, 2);
