import {
  errorHandler as coreErrorHandler,
  logHelper,
  type MapError,
} from '@hungpvq/map-core';
import { logger } from '../store/logger';

const isDev =
  typeof import.meta !== 'undefined' &&
  Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV);

coreErrorHandler.configure({
  isDevelopment: isDev,
  logError: (error: MapError) => {
    logHelper(logger, 'global', 'ErrorHandler').error('Error occurred', {
      code: error.code,
      message: error.message,
      context: error.context,
      stack: error.stack,
    });
  },
  logToService: (error: MapError) => {
    logHelper(logger, 'global', 'ErrorHandler').warn(
      'Error logging service not configured',
      error,
    );
  },
});

export const errorHandler = coreErrorHandler;

export function handleError(
  error: Error,
  context?: Record<string, unknown>,
): void {
  errorHandler.handle(error, context);
}
