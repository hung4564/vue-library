import { loggerFactory } from '@hungpvq/shared-log';
import { MAP_STORE_KEY } from '../types/key';
loggerFactory.disable('map:' + MAP_STORE_KEY.MITT);
loggerFactory.disableEverything();
loggerFactory.enable('map:identify');
export const logger = loggerFactory.createLogger().setNamespace('map:core', 2);
