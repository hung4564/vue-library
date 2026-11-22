import {
  ensureHungpvqDebugHost,
  getDebugErrors,
  getDebugLogs,
  getLiveTraceEvents,
  getRegisteredInstances,
  isClearLogsOnNavigate,
  subscribeDebugData,
  subscribeInstances,
  subscribeLiveTrace,
  type DebugErrorRecord,
  type DebugRecord,
  type DebugTabRegistration,
  type HungpvqDebugHost,
  type InstanceMetadata,
} from '@hungpvq/shared-log';
import { defineStore } from '@hungpvq/shared-store';
import { markRaw, ref, shallowRef } from 'vue';

export const LOG_VUE_UI_STORE_KEY = 'log:vue-ui';

function listVueTabs(host: HungpvqDebugHost): DebugTabRegistration[] {
  return host.listTabs('vue').map((tab) => {
    if (tab.component && typeof tab.component === 'object') {
      markRaw(tab.component);
    }
    return tab;
  });
}

export const useVueLogUiStore = defineStore(LOG_VUE_UI_STORE_KEY, () => {
  const host: HungpvqDebugHost = ensureHungpvqDebugHost();
  const builtinRegistered = ref(false);
  const isOpen = ref(host.isOpen());
  const activeTab = ref(host.getActiveTab());
  const tabs = shallowRef(listVueTabs(host));
  const logs = ref<DebugRecord[]>(getDebugLogs());
  const errors = ref<DebugErrorRecord[]>(getDebugErrors());
  const liveInstances = ref<InstanceMetadata[]>(getRegisteredInstances());
  const liveEvents = ref(getLiveTraceEvents());
  const selectedInstanceId = ref<string | null>(null);
  const selectedEventId = ref<string | null>(null);
  const clearOnNavigate = ref(isClearLogsOnNavigate());

  function syncHost() {
    isOpen.value = host.isOpen();
    activeTab.value = host.getActiveTab();
    tabs.value = listVueTabs(host);
  }

  function syncData() {
    logs.value = getDebugLogs();
    errors.value = getDebugErrors();
    clearOnNavigate.value = isClearLogsOnNavigate();
  }

  function syncLive() {
    liveInstances.value = getRegisteredInstances();
    liveEvents.value = getLiveTraceEvents();
  }

  host.subscribe(syncHost);
  subscribeDebugData(syncData);
  subscribeInstances(syncLive);
  subscribeLiveTrace(syncLive);

  return {
    host,
    builtinRegistered,
    isOpen,
    activeTab,
    tabs,
    logs,
    errors,
    liveInstances,
    liveEvents,
    selectedInstanceId,
    selectedEventId,
    clearOnNavigate,
  };
});
