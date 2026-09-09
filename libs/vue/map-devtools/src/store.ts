import { errorHandler } from '@hungpvq/map-core';
import { reactive, toRefs } from 'vue';
import { DevtoolLogAdapter, LogEntry } from './log-adapter';

export interface ErrorRecord {
  code: string;
  message: string;
  context?: Record<string, any>;
  stack?: string;
  recoverable: boolean;
  timestamp: number;
}

export type DevtoolTab = 'store' | 'logs' | 'errors';

type DevtoolState = {
  isOpen: boolean;
  activeTab: DevtoolTab;
  errors: ErrorRecord[];
  logs: LogEntry[];
};

export const devtoolState = reactive<DevtoolState>({
  isOpen: false,
  activeTab: 'store',
  errors: [],
  logs: [],
});

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeDevtoolState(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDevtoolState(): DevtoolState {
  return devtoolState;
}

export function toggleDevtoolOpen() {
  devtoolState.isOpen = !devtoolState.isOpen;
  notify();
}

export function setDevtoolActiveTab(activeTab: DevtoolTab) {
  devtoolState.activeTab = activeTab;
  notify();
}

/** Open the Devtools panel on the Errors tab. */
export function openMapDevtoolsErrors() {
  devtoolState.isOpen = true;
  setDevtoolActiveTab('errors');
}

const OPEN_DEVTOOLS_ERRORS_EVENT = 'hungpvq:map-open-devtools-errors';

if (typeof window !== 'undefined') {
  window.addEventListener(OPEN_DEVTOOLS_ERRORS_EVENT, () => {
    openMapDevtoolsErrors();
  });
}

export function clearDevtoolLogs() {
  devtoolState.logs = [];
  notify();
}

export function clearDevtoolErrors() {
  devtoolState.errors = [];
  notify();
}

export function useDevtoolState() {
  return toRefs(devtoolState);
}

// Initialize error listener globally
errorHandler.onError((error) => {
  devtoolState.errors.unshift({
    code: error.code,
    message: error.message,
    context: error.context,
    stack: error.stack,
    recoverable: error.recoverable,
    timestamp: Date.now(),
  });

  // Keep only last 50 errors
  if (devtoolState.errors.length > 50) {
    devtoolState.errors = devtoolState.errors.slice(0, 50);
  }
  notify();
});

export const devtoolLogAdapter = new DevtoolLogAdapter();
