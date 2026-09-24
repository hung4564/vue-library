import { MAP_STORE_KEY } from '@hungpvq/map-core';
import { loggerFactory } from '@hungpvq/shared-log';
loggerFactory.disable('map:' + MAP_STORE_KEY.MITT);
loggerFactory.disableEverything();
export const logger = loggerFactory.createLogger().setNamespace('map:core', 2);
