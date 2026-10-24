import { ensureHungpvqDebugHost } from '@hungpvq/shared-log';
import { reactive, toRefs } from 'vue';

const host = ensureHungpvqDebugHost();
const state = reactive({
  isOpen: host.isOpen(),
  activeTab: host.getActiveTab(),
});

host.subscribe(() => {
  state.isOpen = host.isOpen();
  state.activeTab = host.getActiveTab();
});

export function useDevtoolState() {
  return toRefs(state);
}

export type DevtoolTab = string;
