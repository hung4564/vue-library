import { MapError } from '@hungpvq/vue-map-core';

export class DrawError extends MapError {
  constructor(
    message: string,
    options?: {
      context?: Record<string, any>;
      recoverable?: boolean;
      cause?: unknown;
    },
  ) {
    super(message, 'DRAW_ERROR', {
      recoverable: options?.recoverable ?? true,
      context: options?.context,
      cause: options?.cause,
    });
  }
}
