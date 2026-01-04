import { MapError } from '@hungpvq/vue-map-core';

export class DatasetError extends MapError {
  constructor(
    message: string,
    options?: {
      context?: Record<string, any>;
      recoverable?: boolean;
      cause?: unknown;
    },
  ) {
    super(message, 'DATASET_ERROR', {
      recoverable: options?.recoverable ?? true,
      context: options?.context,
      cause: options?.cause,
    });
  }
}
