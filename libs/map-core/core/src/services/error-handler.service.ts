import { loggerFactory } from '@hungpvq/shared-log';
import { MapError } from '../errors';
import { logHelper } from '../utils/log';

const errorLogger = loggerFactory.createLogger().setNamespace('map:core', 2);

function defaultLogError(error: MapError): void {
  logHelper(errorLogger, 'global', 'ErrorHandler').error('Error occurred', {
    code: error.code,
    message: error.message,
    context: error.context,
    stack: error.stack,
  });
}

function defaultLogToService(error: MapError): void {
  logHelper(errorLogger, 'global', 'ErrorHandler').warn(
    'Error logging service not configured',
    error,
  );
}

function isDevEnvironment(): boolean {
  const meta = import.meta as ImportMeta & {
    env?: { DEV?: boolean; MODE?: string };
  };
  if (meta.env && typeof meta.env.DEV === 'boolean') {
    return meta.env.DEV;
  }
  if (meta.env && typeof meta.env.MODE === 'string') {
    return meta.env.MODE !== 'production';
  }
  const nodeProcess = (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process;
  const nodeEnv = nodeProcess?.env?.['NODE_ENV'];
  if (typeof nodeEnv === 'string') {
    return nodeEnv !== 'production';
  }
  return false;
}

/**
 * Interface for error handling.
 */
export interface ErrorHandler {
  handle(error: Error, context?: Record<string, unknown>): void;
  handleOnce(error: Error, context?: Record<string, unknown>): void;
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
  private handledOnce = new WeakSet<object>();

  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      isDevelopment: isDevEnvironment(),
      logError: defaultLogError,
      logToService: defaultLogToService,
      ...options,
    };
  }

  configure(options: Partial<ErrorHandlerOptions>): void {
    this.options = {
      ...this.options,
      ...options,
      logError: options.logError ?? this.options.logError ?? defaultLogError,
      logToService:
        options.logToService ?? this.options.logToService ?? defaultLogToService,
    };
  }

  /**
   * Handle an error at most once per Error instance (avoids duplicate Devtools entries).
   */
  handleOnce(error: Error, context?: Record<string, unknown>): void {
    if (this.handledOnce.has(error)) {
      if (error instanceof MapError && context) {
        error.setContext(context);
      }
      return;
    }
    this.handledOnce.add(error);
    this.handle(error, context);
  }

  /**
   * Handle an error.
   * @param error - The error to handle
   * @param context - Additional context about the error
   */
  handle(error: Error, context?: Record<string, unknown>): void {
    const mapError = this.normalizeError(error, context);
    this.handledOnce.add(mapError);

    if (this.options.isDevelopment) {
      (this.options.logError ?? defaultLogError)(mapError);
    } else {
      (this.options.logToService ?? defaultLogToService)(mapError);
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
