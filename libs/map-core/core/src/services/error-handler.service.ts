import { MapError } from '../errors';

function isDevEnvironment(): boolean {
  try {
    return Boolean(import.meta.env?.DEV);
  } catch {
    return process.env.NODE_ENV !== 'production';
  }
}

/**
 * Interface for error handling.
 */
export interface ErrorHandler {
  handle(error: Error, context?: Record<string, unknown>): void;
  onError(callback: (error: MapError) => void): () => void;
}

/**
 * Options for error handler
 */
export interface ErrorHandlerOptions {
  isDevelopment?: boolean;
  logError?: (error: MapError) => void;
  logToService?: (error: MapError) => void;
}

/**
 * Centralized error handler for map operations.
 * Handles logging, normalization, and notification of errors.
 */
export class MapErrorHandler implements ErrorHandler {
  private listeners: Set<(error: MapError) => void> = new Set();
  private options: ErrorHandlerOptions;

  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      isDevelopment: options.isDevelopment ?? isDevEnvironment(),
      logError: options.logError,
      logToService: options.logToService,
      ...options,
    };
  }

  configure(options: Partial<ErrorHandlerOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Handle an error.
   * @param error - The error to handle
   * @param context - Additional context about the error
   */
  handle(error: Error, context?: Record<string, unknown>): void {
    const mapError = this.normalizeError(error, context);

    // Log to console in dev
    if (this.options.isDevelopment) {
      if (this.options.logError) {
        this.options.logError(mapError);
      } else {
        console.error('Error occurred', {
          code: mapError.code,
          message: mapError.message,
          context: mapError.context,
          stack: mapError.stack,
        });
      }
    }

    // Log to external service in production
    if (!this.options.isDevelopment) {
      if (this.options.logToService) {
        this.options.logToService(mapError);
      } else {
        // Default: log to console as warning
        console.warn('Error logging service not configured:', mapError);
      }
    }

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(mapError);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  /**
   * Register a callback to be called when an error occurs.
   * @param callback - The callback function
   * @returns A function to unregister the callback
   */
  onError(callback: (error: MapError) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Normalize any error to a MapError.
   */
  private normalizeError(
    error: Error,
    context?: Record<string, unknown>,
  ): MapError {
    if (error instanceof MapError) {
      // Merge additional context if provided
      if (context) {
        error.setContext(context);
      }
      return error;
    }

    return new MapError(
      error.message || 'An unknown error occurred',
      'UNKNOWN_ERROR',
      { context: { ...context }, cause: error },
    );
  }
}

/**
 * Default singleton instance of the error handler.
 * Can be replaced by creating a new instance with custom options.
 */
export const errorHandler = new MapErrorHandler();
