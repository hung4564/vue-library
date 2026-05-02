import type { ErrorHandlerOptions, MapError } from '@hungpvq/map-core';
import { MapErrorHandler, logHelper } from '@hungpvq/map-core';
import { logger } from '../logger';

/**
 * Vue-specific error handler instance
 * Uses MapErrorHandler directly with Vue-specific logging options
 */
export const errorHandler = new MapErrorHandler({
  isDevelopment: import.meta.env.DEV,
  logError: (error: MapError) => {
    logHelper(logger, 'global', 'ErrorHandler').error('Error occurred', {
      code: error.code,
      message: error.message,
      context: error.context,
      stack: error.stack,
    });
  },
  logToService: (error: MapError) => {
    // Log to external service in production
    // TODO: Integrate with error tracking service
    console.warn('Error logging service not configured:', error);
  },
} as ErrorHandlerOptions);
