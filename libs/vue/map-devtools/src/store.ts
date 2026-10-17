import {
  type DevtoolErrorRecord,
  type DevtoolTab,
  getDevtoolState as getDevtoolStateCore,
  subscribeDevtoolState,
} from '@hungpvq/map-debug';
import { reactive, toRefs } from 'vue';

export type ErrorRecord = DevtoolErrorRecord;

export type { DevtoolTab };

const devtoolState = reactive(getDevtoolStateCore());

subscribeDevtoolState(() => {
  const next = getDevtoolStateCore();
  devtoolState.isOpen = next.isOpen;
  devtoolState.activeTab = next.activeTab;
  devtoolState.errors = next.errors;
  devtoolState.logs = next.logs;
});

export function getDevtoolState() {
  return devtoolState;
}

export function useDevtoolState() {
  return toRefs(devtoolState);
}
