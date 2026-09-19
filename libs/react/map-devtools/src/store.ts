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
  type DevtoolLogEntry,
  type DevtoolTab,
} from '@hungpvq/map-core/devtools';

export type ErrorRecord = DevtoolErrorRecord;

export type { DevtoolTab };
export type { DevtoolLogEntry as LogEntry };

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
  set logs(value: DevtoolLogEntry[]) {
    replaceDevtoolLogs(value);
  },
};

export const devtoolLogAdapter = createDevtoolLogAdapter();
