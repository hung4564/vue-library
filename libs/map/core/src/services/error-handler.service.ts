import { logHelper } from '@hungpvq/shared-map';
import { MapError } from '../errors';
import { logger } from '../logger';

/**
 * Interface for error handling.
 */
export interface ErrorHandler {
  handle(error: Error, context?: Record<string, any>): void;
  onError(callback: (error: MapError) => void): () => void;
}

/**
 * Centralized error handler for map operations.
 * Handles logging, normalization, and notification of errors.
 */
export class MapErrorHandler implements ErrorHandler {
  private listeners: Set<(error: MapError) => void> = new Set();

  /**
   * Handle an error.
   * @param error - The error to handle
   * @param context - Additional context about the error
   */
  handle(error: Error, context?: Record<string, any>): void {
    const mapError = this.normalizeError(error, context);

    // Log to console in dev
    if (import.meta.env.DEV) {
      logHelper(logger, 'global', 'ErrorHandler').error('Error occurred', {
        code: mapError.code,
        message: mapError.message,
        context: mapError.context,
        stack: mapError.stack,
      });
    }

    // Log to external service in production
    if (import.meta.env.PROD) {
      this.logToService(mapError);
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
    context?: Record<string, any>,
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

  /**
   * Log error to external service (e.g., Sentry, LogRocket).
   */
  private logToService(error: MapError): void {
    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(error);
    console.warn('Error logging service not configured:', error);
  }
}

/**
 * Singleton instance of the error handler.
 */
export const errorHandler = new MapErrorHandler();
