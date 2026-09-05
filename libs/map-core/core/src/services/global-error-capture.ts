import type { ErrorHandler } from './error-handler.service';

function normalizeGlobalError(reason: unknown): Error {
  if (reason instanceof Error) {
    return reason;
  }
  return new Error(typeof reason === 'string' ? reason : String(reason));
}

/**
 * Capture uncaught window errors and unhandled promise rejections
 * into the centralized error handler (e.g. devtools Errors tab).
 */
export function installGlobalErrorCapture(handler: ErrorHandler): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const onWindowError = (event: ErrorEvent) => {
    handler.handle(normalizeGlobalError(event.error ?? event.message), {
      source: 'window.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    handler.handle(normalizeGlobalError(event.reason), {
      source: 'unhandledrejection',
    });
  };

  window.addEventListener('error', onWindowError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);

  return () => {
    window.removeEventListener('error', onWindowError);
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
  };
}

function isDevEnvironment(): boolean {
  try {
    return Boolean(import.meta.env?.DEV);
  } catch {
    return process.env.NODE_ENV !== 'production';
  }
}
