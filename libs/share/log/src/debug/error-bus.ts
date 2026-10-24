import { ensureHungpvqDebugHost } from './host';
import {
  type DebugErrorRecord,
  getLogDebugStore,
  notifyDebugData,
} from './store';

const MAX_ERRORS = 50;

export function reportDebugError(
  error: Omit<DebugErrorRecord, 'timestamp'> & { timestamp?: number },
): void {
  const bag = getLogDebugStore();
  bag.errors = [
    {
      code: error.code,
      message: error.message,
      context: error.context,
      stack: error.stack,
      recoverable: error.recoverable,
      timestamp: error.timestamp ?? Date.now(),
    },
    ...bag.errors,
  ].slice(0, MAX_ERRORS);
  notifyDebugData();
  ensureHungpvqDebugHost();
}

export function clearDebugErrors(): void {
  getLogDebugStore().errors = [];
  notifyDebugData();
}

export function replaceDebugErrors(errors: DebugErrorRecord[]): void {
  getLogDebugStore().errors = [...errors];
  notifyDebugData();
}

function toErrorRecord(
  error: unknown,
  fallbackCode: string,
): Omit<DebugErrorRecord, 'timestamp'> {
  if (error instanceof Error) {
    return {
      code: error.name || fallbackCode,
      message: error.message,
      stack: error.stack,
      recoverable: true,
    };
  }
  return {
    code: fallbackCode,
    message: String(error),
    recoverable: true,
  };
}

export function installWindowErrorCapture(): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const onError = (event: ErrorEvent) => {
    reportDebugError({
      ...toErrorRecord(event.error ?? event.message, 'WindowError'),
      context: { filename: event.filename, lineno: event.lineno },
    });
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    reportDebugError(toErrorRecord(event.reason, 'UnhandledRejection'));
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}
