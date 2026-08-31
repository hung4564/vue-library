import type { MapError } from '@hungpvq/map-core';
import { MapErrorHandler, logHelper } from '@hungpvq/map-core';
import { logger } from '../store/logger';

export const errorHandler = new MapErrorHandler({
  logError: (error: MapError) => {
    logHelper(logger, 'global', 'ErrorHandler').error('Error occurred', {
      code: error.code,
      message: error.message,
      context: error.context,
      stack: error.stack,
    });
  },
  logToService: (error: MapError) => {
    console.warn('Error logging service not configured:', error);
  },
});

export function handleError(error: Error, context?: Record<string, unknown>): void {
  errorHandler.handle(error, context);
}
