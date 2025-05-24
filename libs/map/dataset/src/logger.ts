import { loggerFactory } from '@hungpvq/shared-log';
export const logger = loggerFactory
  .createLogger()
  .setNamespace('map:dataset', 2);
