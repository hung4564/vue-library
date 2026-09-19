import { reactive, toRefs } from 'vue';
import {
  clearDevtoolErrors as clearDevtoolErrorsCore,
  clearDevtoolLogs as clearDevtoolLogsCore,
  createDevtoolLogAdapter,
  getDevtoolState as getDevtoolStateCore,
  initDevtoolStoreCore,
  openMapDevtoolsErrors as openMapDevtoolsErrorsCore,
  setDevtoolActiveTab as setDevtoolActiveTabCore,
  setDevtoolFilterMapId as setDevtoolFilterMapIdCore,
  setDevtoolOpen as setDevtoolOpenCore,
  subscribeDevtoolState,
  toggleDevtoolOpen as toggleDevtoolOpenCore,
  type BufferingLogEntry as LogEntry,
  type DevtoolErrorRecord,
  type DevtoolTab,
} from '@hungpvq/map-core/devtools';

export type ErrorRecord = DevtoolErrorRecord;

export type { DevtoolTab, LogEntry };

initDevtoolStoreCore();

const devtoolState = reactive(getDevtoolStateCore());

subscribeDevtoolState(() => {
  const next = getDevtoolStateCore();
  devtoolState.isOpen = next.isOpen;
  devtoolState.activeTab = next.activeTab;
  devtoolState.filterMapId = next.filterMapId;
  devtoolState.errors = next.errors;
  devtoolState.logs = next.logs;
});

export { devtoolState, subscribeDevtoolState };

export function getDevtoolState() {
  return devtoolState;
}

export function toggleDevtoolOpen() {
  toggleDevtoolOpenCore();
}

export function setDevtoolOpen(open: boolean) {
  setDevtoolOpenCore(open);
}

export function setDevtoolActiveTab(activeTab: DevtoolTab) {
  setDevtoolActiveTabCore(activeTab);
}

export function setDevtoolFilterMapId(filterMapId: string) {
  setDevtoolFilterMapIdCore(filterMapId);
}

export function openMapDevtoolsErrors() {
  openMapDevtoolsErrorsCore();
}

export function clearDevtoolLogs() {
  clearDevtoolLogsCore();
}

export function clearDevtoolErrors() {
  clearDevtoolErrorsCore();
}

export function useDevtoolState() {
  return toRefs(devtoolState);
}

export const devtoolLogAdapter = createDevtoolLogAdapter();
