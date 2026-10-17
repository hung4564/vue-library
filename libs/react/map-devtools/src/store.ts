import {
  getDevtoolState,
  subscribeDevtoolState,
  type DevtoolErrorRecord,
  type DevtoolTab,
} from '@hungpvq/map-debug';
import { useSyncExternalStore } from 'react';

export type ErrorRecord = DevtoolErrorRecord;

export type { DevtoolTab };

export function useDevtoolState() {
  return useSyncExternalStore(
    subscribeDevtoolState,
    getDevtoolState,
    getDevtoolState,
  );
}
