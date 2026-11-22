import { loggerFactory } from '@hungpvq/shared-log';

export const logger = loggerFactory.createLogger().setNamespace('map:dataset');

export const loggerIdentify = loggerFactory
  .createLogger()
  .setNamespace('map:identify');

export const loggerHighlight = loggerFactory
  .createLogger()
  .setNamespace('map:highlight');
