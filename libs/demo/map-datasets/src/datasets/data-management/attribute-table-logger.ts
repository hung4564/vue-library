import { loggerFactory } from '@hungpvq/shared-log';

/** Shared logger for Attribute Table demos (Vue + React). */
export const attributeTableDemoLogger = loggerFactory
  .createLogger()
  .setNamespace('demo:attribute-table', 2);
