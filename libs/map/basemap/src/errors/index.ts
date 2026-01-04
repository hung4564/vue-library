import { MapError } from '@hungpvq/vue-map-core';

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
