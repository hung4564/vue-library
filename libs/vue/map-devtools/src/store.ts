import { errorHandler } from '@hungpvq/vue-map-core';
import { reactive } from 'vue';
import { DevtoolLogAdapter, LogEntry } from './log-adapter';

export interface ErrorRecord {
  code: string;
  message: string;
  context?: Record<string, any>;
  stack?: string;
  recoverable: boolean;
  timestamp: number;
}

export const devtoolState = reactive<{
  isOpen: boolean;
  activeTab: string;
  errors: ErrorRecord[];
  logs: LogEntry[];
}>({
  isOpen: false,
  activeTab: 'store',
  errors: [],
  logs: [],
});

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
});

export const devtoolLogAdapter = new DevtoolLogAdapter();
