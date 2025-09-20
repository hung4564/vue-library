import { loggerFactory } from '@hungpvq/shared-log';
export const logger = loggerFactory
  .createLogger()
  .setNamespace('map:dataset', 2);

export const loggerIdentify = loggerFactory
  .createLogger()
  .setNamespace('map:identify', 2);

export const loggerHighlight = loggerFactory
  .createLogger()
  .setNamespace('map:highlight', 2);
