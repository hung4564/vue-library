import type { ErrorHandlerOptions, MapError } from '@hungpvq/map-core';
import { MapErrorHandler, logHelper } from '@hungpvq/map-core';
import { logger } from '../store/logger';

/**
 * Error handler instance for map operations
 */
export const errorHandler = new MapErrorHandler({
  logger: logHelper(logger, 'error-handler', 'service'),
});

/**
 * Handle error with options
 */
export function handleError(error: Error, options?: ErrorHandlerOptions): void {
  errorHandler.handle(error, options);
}
