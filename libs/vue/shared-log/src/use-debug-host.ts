import { markRaw, onMounted, onUnmounted, ref, shallowRef } from 'vue';

import {
  ensureHungpvqDebugHost,
  getDebugErrors,
  getDebugLogs,
  subscribeDebugData,
  type DebugErrorRecord,
  type DebugTabRegistration,
  type HungpvqDebugHost,
  type LogRecord,
} from '@hungpvq/shared-log';

function listVueTabs(host: HungpvqDebugHost): DebugTabRegistration[] {
  return host.listTabs('vue').map((tab) => {
    if (tab.component && typeof tab.component === 'object') {
      markRaw(tab.component);
    }
    return tab;
  });
}

export function useDebugHost() {
  const host: HungpvqDebugHost = ensureHungpvqDebugHost();
  const isOpen = ref(host.isOpen());
  const activeTab = ref(host.getActiveTab());
  const tabs = shallowRef(listVueTabs(host));
  const logs = ref<LogRecord[]>(getDebugLogs());
  const errors = ref<DebugErrorRecord[]>(getDebugErrors());

  function syncHost() {
    isOpen.value = host.isOpen();
    activeTab.value = host.getActiveTab();
    tabs.value = listVueTabs(host);
  }

  function syncData() {
    logs.value = getDebugLogs();
    errors.value = getDebugErrors();
  }

  onMounted(() => {
    const stopHost = host.subscribe(syncHost);
    const stopData = subscribeDebugData(syncData);
    syncHost();
    syncData();
    onUnmounted(() => {
      stopHost();
      stopData();
    });
  });

  return { host, isOpen, activeTab, tabs, logs, errors };
}
