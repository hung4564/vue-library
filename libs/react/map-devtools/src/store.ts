import { errorHandler } from '@hungpvq/react-map-core';
import { DevtoolLogAdapter, LogEntry } from './log-adapter';

export interface ErrorRecord {
  code: string;
  message: string;
  context?: Record<string, unknown>;
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

export function subscribeDevtoolState(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDevtoolState(): DevtoolState {
  return state;
}

export function toggleDevtoolOpen() {
  state = { ...state, isOpen: !state.isOpen };
  notify();
}

export function setDevtoolActiveTab(activeTab: DevtoolTab) {
  state = { ...state, activeTab };
  notify();
}

export function clearDevtoolLogs() {
  state = { ...state, logs: [] };
  notify();
}

export function clearDevtoolErrors() {
  state = { ...state, errors: [] };
  notify();
}

export const devtoolState = {
  get isOpen() {
    return state.isOpen;
  },
  set isOpen(value: boolean) {
    state = { ...state, isOpen: value };
    notify();
  },
  get activeTab() {
    return state.activeTab;
  },
  set activeTab(value: DevtoolTab) {
    state = { ...state, activeTab: value };
    notify();
  },
  get errors() {
    return state.errors;
  },
  set errors(value: ErrorRecord[]) {
    state = { ...state, errors: value };
    notify();
  },
  get logs() {
    return state.logs;
  },
  set logs(value: LogEntry[]) {
    state = { ...state, logs: value };
    notify();
  },
};

export const devtoolLogAdapter = new DevtoolLogAdapter();

errorHandler.onError((error) => {
  devtoolState.errors = [
    {
      code: error.code,
      message: error.message,
      context: error.context,
      stack: error.stack,
      recoverable: error.recoverable,
      timestamp: Date.now(),
    },
    ...devtoolState.errors,
  ].slice(0, 50);
});
