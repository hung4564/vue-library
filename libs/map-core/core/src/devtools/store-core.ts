import {
  BufferingLogAdapter,
  type BufferingLogEntry,
} from './BufferingLogAdapter';
import { errorHandler } from '../services/error-handler.service';

export type DevtoolTab = 'store' | 'logs' | 'errors' | 'dataset';

export interface DevtoolErrorRecord {
  code: string;
  message: string;
  context?: Record<string, unknown>;
  stack?: string;
  recoverable: boolean;
  timestamp: number;
}

export type DevtoolLogEntry = BufferingLogEntry;

export type DevtoolState = {
  isOpen: boolean;
  activeTab: DevtoolTab;
  errors: DevtoolErrorRecord[];
  logs: DevtoolLogEntry[];
};

let state: DevtoolState = {
  isOpen: false,
  activeTab: 'store',
  errors: [],
  logs: [],
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function patchState(patch: Partial<DevtoolState>) {
  state = { ...state, ...patch };
  notify();
}

export function subscribeDevtoolState(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDevtoolState(): DevtoolState {
  return state;
}

export function toggleDevtoolOpen() {
  patchState({ isOpen: !state.isOpen });
}

export function setDevtoolOpen(open: boolean) {
  if (state.isOpen === open) return;
  patchState({ isOpen: open });
}

export function setDevtoolActiveTab(activeTab: DevtoolTab) {
  patchState({ activeTab });
}

/** Open the Devtools panel on the Errors tab. */
export function openMapDevtoolsErrors() {
  patchState({ isOpen: true, activeTab: 'errors' });
}

export const OPEN_DEVTOOLS_ERRORS_EVENT = 'hungpvq:map-open-devtools-errors';

let errorsShortcutInstalled = false;

export function installDevtoolsErrorsShortcut() {
  if (typeof window === 'undefined' || errorsShortcutInstalled) return;
  errorsShortcutInstalled = true;
  window.addEventListener(OPEN_DEVTOOLS_ERRORS_EVENT, () => {
    openMapDevtoolsErrors();
  });
}

export function clearDevtoolLogs() {
  patchState({ logs: [] });
}

export function clearDevtoolErrors() {
  patchState({ errors: [] });
}

export function replaceDevtoolLogs(logs: DevtoolLogEntry[]) {
  patchState({ logs });
}

export function replaceDevtoolErrors(errors: DevtoolErrorRecord[]) {
  patchState({ errors });
}

let errorListenerInstalled = false;

export function installDevtoolErrorListener() {
  if (errorListenerInstalled) return;
  errorListenerInstalled = true;

  errorHandler.onError((error) => {
    patchState({
      errors: [
        {
          code: error.code,
          message: error.message,
          context: error.context,
          stack: error.stack,
          recoverable: error.recoverable,
          timestamp: Date.now(),
        },
        ...state.errors,
      ].slice(0, 50),
    });
  });
}

export function createDevtoolLogAdapter() {
  return new BufferingLogAdapter({
    getLogs: () => state.logs,
    setLogs: (logs) => patchState({ logs }),
  });
}

/** Initialize shared devtools store side effects (idempotent). */
export function initDevtoolStoreCore() {
  installDevtoolsErrorsShortcut();
  installDevtoolErrorListener();
}
