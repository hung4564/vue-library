import type { ErrorHandlerOptions, MapError } from '@hungpvq/map-core';
import {
  errorHandler as coreErrorHandler,
  logHelper,
  MapErrorHandler,
} from '@hungpvq/map-core';
import { logger } from '../logger';

coreErrorHandler.configure({
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
    logHelper(logger, 'global', 'ErrorHandler').warn(
      'Error logging service not configured',
      error,
    );
  },
} as ErrorHandlerOptions);

export const errorHandler = coreErrorHandler;

/** @deprecated Use errorHandler directly — kept for backwards compatibility */
export { MapErrorHandler };
