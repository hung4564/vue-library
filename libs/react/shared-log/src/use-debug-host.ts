import {
  ensureHungpvqDebugHost,
  getDebugErrors,
  getDebugLogs,
  subscribeDebugData,
  type DebugErrorRecord,
  type HungpvqDebugHost,
  type LogRecord,
} from '@hungpvq/shared-log';
import { useSyncExternalStore } from 'react';

function subscribe(cb: () => void) {
  const host = ensureHungpvqDebugHost();
  const a = host.subscribe(cb);
  const b = subscribeDebugData(cb);
  return () => {
    a();
    b();
  };
}

function getSnapshot() {
  const host = ensureHungpvqDebugHost();
  return {
    host,
    isOpen: host.isOpen(),
    activeTab: host.getActiveTab(),
    tabs: host.listTabs('react'),
    logs: getDebugLogs(),
    errors: getDebugErrors(),
  };
}

export function useDebugHost(): {
  host: HungpvqDebugHost;
  isOpen: boolean;
  activeTab: string;
  tabs: ReturnType<HungpvqDebugHost['listTabs']>;
  logs: LogRecord[];
  errors: DebugErrorRecord[];
} {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
