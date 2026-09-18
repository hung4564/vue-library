import { getOrCreateStore } from '@hungpvq/shared-store';
import type { ErrorHandler } from './error-handler.service';

function normalizeGlobalError(reason: unknown): Error {
  if (reason instanceof Error) {
    return reason;
  }
  return new Error(typeof reason === 'string' ? reason : String(reason));
}

type ErrorCaptureSlot = {
  installed: boolean;
  uninstall: (() => void) | undefined;
};

function errorCaptureSlot(): ErrorCaptureSlot {
  return getOrCreateStore('__hungpvq_map_errorCapture__', () => ({
    installed: false,
    uninstall: undefined as (() => void) | undefined,
  }));
}

/**
 * Capture uncaught window errors and unhandled promise rejections
 * into the centralized error handler (e.g. devtools Errors tab).
 * Duplicate installs (duplicate package copies) share one listener pair.
 */
export function installGlobalErrorCapture(handler: ErrorHandler): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const slot = errorCaptureSlot();
  if (slot.installed && slot.uninstall) {
    return slot.uninstall;
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

  const uninstall = () => {
    window.removeEventListener('error', onWindowError);
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
    slot.installed = false;
    slot.uninstall = undefined;
  };

  slot.installed = true;
  slot.uninstall = uninstall;
  return uninstall;
}
