import {
  ensureHungpvqDebugHost,
  subscribeDebugData,
} from '@hungpvq/shared-log';
import { useSyncExternalStore } from 'react';

import {
  ensureReactLogUiStore,
  readDebugHostSnapshot,
  type ReactDebugHostSnapshot,
} from './store';

function subscribe(cb: () => void) {
  const host = ensureHungpvqDebugHost();
  const a = host.subscribe(cb);
  const b = subscribeDebugData(cb);
  return () => {
    a();
    b();
  };
}

function sameTabs(
  a: ReactDebugHostSnapshot['tabs'],
  b: ReactDebugHostSnapshot['tabs'],
): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((tab, i) => tab === b[i]);
}

function getSnapshot(): ReactDebugHostSnapshot {
  const ui = ensureReactLogUiStore();
  const next = readDebugHostSnapshot();
  const cached = ui.debugHostSnapshot;
  if (
    cached &&
    cached.host === next.host &&
    cached.isOpen === next.isOpen &&
    cached.activeTab === next.activeTab &&
    cached.logs === next.logs &&
    cached.errors === next.errors &&
    cached.clearOnNavigate === next.clearOnNavigate &&
    sameTabs(cached.tabs, next.tabs)
  ) {
    return cached;
  }
  ui.debugHostSnapshot = next;
  return next;
}

export function useDebugHost(): ReactDebugHostSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
