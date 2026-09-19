import {
  clearDevtoolErrors,
  clearDevtoolLogs,
  createDevtoolLogAdapter,
  getDevtoolState,
  initDevtoolStoreCore,
  openMapDevtoolsErrors,
  replaceDevtoolErrors,
  replaceDevtoolLogs,
  setDevtoolActiveTab,
  setDevtoolFilterMapId,
  setDevtoolOpen,
  subscribeDevtoolState,
  toggleDevtoolOpen,
  type DevtoolErrorRecord,
  type DevtoolTab,
} from '@hungpvq/map-core/devtools';
import type { LogAdapter, LogRecord } from '@hungpvq/shared-log';

export type ErrorRecord = DevtoolErrorRecord;

export type { DevtoolTab };

initDevtoolStoreCore();

export {
  clearDevtoolErrors,
  clearDevtoolLogs,
  getDevtoolState,
  openMapDevtoolsErrors,
  setDevtoolActiveTab,
  setDevtoolFilterMapId,
  setDevtoolOpen,
  subscribeDevtoolState,
  toggleDevtoolOpen,
};

export const devtoolState = {
  get isOpen() {
    return getDevtoolState().isOpen;
  },
  set isOpen(value: boolean) {
    setDevtoolOpen(value);
  },
  get activeTab() {
    return getDevtoolState().activeTab;
  },
  set activeTab(value: DevtoolTab) {
    setDevtoolActiveTab(value);
  },
  get filterMapId() {
    return getDevtoolState().filterMapId;
  },
  set filterMapId(value: string) {
    setDevtoolFilterMapId(value);
  },
  get errors() {
    return getDevtoolState().errors;
  },
  set errors(value: ErrorRecord[]) {
    replaceDevtoolErrors(value);
  },
  get logs() {
    return getDevtoolState().logs;
  },
  set logs(value: LogRecord[]) {
    replaceDevtoolLogs(value);
  },
};

/** Lazy — created on first use so `installDevtools({ logStore })` can configure first. */
export const devtoolLogAdapter: LogAdapter = new Proxy({} as LogAdapter, {
  get(_target, prop, _receiver) {
    const adapter = createDevtoolLogAdapter();
    const value = Reflect.get(adapter as object, prop, adapter);
    return typeof value === 'function'
      ? (value as (...args: unknown[]) => unknown).bind(adapter)
      : value;
  },
});
