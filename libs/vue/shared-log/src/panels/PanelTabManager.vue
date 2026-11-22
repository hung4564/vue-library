<template>
  <DevtoolPanelContainer>
    <template #title>
      <DevtoolPanelToolbar>
        <template #actions>
          <BaseButton
            title="Enable all tabs"
            @click="onEnableAll"
          >
            Enable All
          </BaseButton>
          <BaseButton
            title="Disable all tabs except manager"
            @click="onDisableAll"
          >
            Disable All
          </BaseButton>
        </template>
      </DevtoolPanelToolbar>
    </template>
    <DevtoolPanelCard>
      <List
        v-if="allTabs.length > 0"
        dense
        divided
      >
        <ListItem
          v-for="tab in allTabs"
          :key="tab.id"
          dense
          :disabled="tab.id === 'tabs'"
          :interactive="tab.id !== 'tabs'"
          @click="tab.id !== 'tabs' && onToggle(tab.id)"
        >
          <template #prefix>
            <InputCheckbox
              :model-value="isTabActive(tab.id)"
              :disabled="tab.id === 'tabs'"
              :aria-label="`Toggle ${resolveTabLabel(tab)} tab`"
              @click.stop
              @update:model-value="onToggle(tab.id)"
            />
          </template>
          {{ resolveTabLabel(tab) }}
          <template #suffix>
            <span class="devtool-tab-manager__meta">
              <code>{{ tab.id }}</code>
              <span class="devtool-tab-manager__order">#{{ tab.order ?? 50 }}</span>
            </span>
          </template>
        </ListItem>
      </List>
      <div
        v-else
        class="devtool-tab-manager__empty"
      >
        No registered tabs found.
      </div>
    </DevtoolPanelCard>
  </DevtoolPanelContainer>
</template>

<script setup lang="ts">
import {
  ensureHungpvqDebugHost,
  isDebugTabEnabled,
  listAllDebugTabs,
  setDebugTabEnabled,
  type DebugTabRegistration,
} from '@hungpvq/shared-log';
import { BaseButton, InputCheckbox, List, ListItem } from '@hungpvq/vue-ui-core';
import { onMounted, onUnmounted, ref } from 'vue';

import DevtoolPanelCard from '../ui/DevtoolPanelCard.vue';
import DevtoolPanelContainer from '../ui/DevtoolPanelContainer.vue';
import DevtoolPanelToolbar from '../ui/DevtoolPanelToolbar.vue';

const allTabs = ref<DebugTabRegistration[]>([]);

function syncTabs() {
  allTabs.value = listAllDebugTabs('vue');
}

function resolveTabLabel(tab: DebugTabRegistration): string {
  return typeof tab.label === 'function' ? tab.label() : tab.label;
}

function isTabActive(id: string): boolean {
  return isDebugTabEnabled(id);
}

function onToggle(id: string) {
  setDebugTabEnabled(id, !isDebugTabEnabled(id));
  syncTabs();
}

function onEnableAll() {
  for (const tab of allTabs.value) {
    setDebugTabEnabled(tab.id, true);
  }
  syncTabs();
}

function onDisableAll() {
  for (const tab of allTabs.value) {
    if (tab.id !== 'tabs') {
      setDebugTabEnabled(tab.id, false);
    }
  }
  syncTabs();
}

let unsub: (() => void) | undefined;
onMounted(() => {
  syncTabs();
  unsub = ensureHungpvqDebugHost().subscribe(syncTabs);
});

onUnmounted(() => {
  unsub?.();
});
</script>
