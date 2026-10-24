<template>
  <div class="devtools-popup-body">
    <div class="devtools-header">
      <Tabs
        v-model="active"
        :items="tabItems"
        :with-panes="false"
      />
      <BaseButton
        v-if="showClose"
        class="close-btn"
        @click="emit('close')"
      >
        X
      </BaseButton>
    </div>
    <div class="devtools-content">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="devtools-content__pane"
        :hidden="activeTab !== tab.id"
      >
        <component :is="tab.component" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DebugTabRegistration } from '@hungpvq/shared-log';
import { BaseButton, Tabs } from '@hungpvq/vue-ui-core';
import { computed } from 'vue';

import { registerBuiltinDebugTabs } from './register-builtin';
import { useDebugHost } from './use-debug-host';

registerBuiltinDebugTabs();

withDefaults(
  defineProps<{
    showClose?: boolean;
  }>(),
  { showClose: false },
);

const emit = defineEmits<{ close: [] }>();
const { host, activeTab, tabs } = useDebugHost();

function tabLabel(tab: DebugTabRegistration): string {
  const base = typeof tab.label === 'function' ? tab.label() : tab.label;
  const badge = tab.badge?.();
  if (badge == null || badge === '' || String(base).includes(String(badge))) {
    return base;
  }
  return `${base} (${badge})`;
}

const tabItems = computed(() =>
  tabs.value.map((tab) => ({ id: tab.id, label: tabLabel(tab) })),
);

const active = computed({
  get: () => activeTab.value,
  set: (id: string) => host.setActiveTab(id),
});
</script>
