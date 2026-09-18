import { MapError } from '../errors';

/**
 * Error thrown when basemap operations fail.
 */
export class BasemapError extends MapError {
  constructor(
    message: string,
    options?: {
      context?: Record<string, any>;
      recoverable?: boolean;
      cause?: unknown;
    },
  ) {
    super(message, 'BASEMAP_ERROR', {
      recoverable: options?.recoverable ?? true,
      context: options?.context,
      cause: options?.cause,
    });
  }
}
