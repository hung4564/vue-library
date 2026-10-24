import { ensureHungpvqDebugHost } from '@hungpvq/shared-log';
import { useSyncExternalStore } from 'react';

const host = ensureHungpvqDebugHost();

function subscribe(cb: () => void) {
  return host.subscribe(cb);
}

function getSnapshot() {
  return {
    isOpen: host.isOpen(),
    activeTab: host.getActiveTab(),
  };
}

export function useDevtoolState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export type DevtoolTab = string;
export type ErrorRecord = unknown;
