import {
  ensureHungpvqDebugHost,
  getDebugErrors,
  getDebugLogs,
  getLiveTraceEvents,
  getRegisteredInstances,
  isClearLogsOnNavigate,
  type DebugErrorRecord,
  type DebugRecord,
  type HungpvqDebugHost,
  type InstanceMetadata,
} from '@hungpvq/shared-log';
import { getOrCreateStore } from '@hungpvq/shared-store';

export const LOG_REACT_UI_STORE_KEY = 'log:react-ui';

export type ReactDebugHostSnapshot = {
  host: HungpvqDebugHost;
  isOpen: boolean;
  activeTab: string;
  tabs: ReturnType<HungpvqDebugHost['listTabs']>;
  logs: DebugRecord[];
  errors: DebugErrorRecord[];
  clearOnNavigate: boolean;
};

export type ReactLiveSnapshot = {
  instances: InstanceMetadata[];
  events: ReturnType<typeof getLiveTraceEvents>;
};

export type ReactLogUiStore = {
  builtinRegistered: boolean;
  debugHostSnapshot: ReactDebugHostSnapshot | null;
  liveSnapshot: ReactLiveSnapshot | null;
};

export function ensureReactLogUiStore(): ReactLogUiStore {
  return getOrCreateStore<ReactLogUiStore>(LOG_REACT_UI_STORE_KEY, () => ({
    builtinRegistered: false,
    debugHostSnapshot: null,
    liveSnapshot: null,
  }));
}

export function readDebugHostSnapshot(): ReactDebugHostSnapshot {
  const host = ensureHungpvqDebugHost();
  return {
    host,
    isOpen: host.isOpen(),
    activeTab: host.getActiveTab(),
    tabs: host.listTabs('react'),
    logs: getDebugLogs(),
    errors: getDebugErrors(),
    clearOnNavigate: isClearLogsOnNavigate(),
  };
}

export function readLiveSnapshot(): ReactLiveSnapshot {
  return {
    instances: getRegisteredInstances(),
    events: getLiveTraceEvents(),
  };
}
