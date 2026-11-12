<template>
  <DevtoolPanelContainer>
    <template #title>
      <DevtoolPanelToolbar>
        <template #actions>
          <BaseButton
            title="Refresh store snapshot"
            :disabled="refreshPhase === 'loading'"
            @click="onRefresh"
          >
            {{ refreshLabel }}
          </BaseButton></template
        >
      </DevtoolPanelToolbar>
    </template>
    <DevtoolPanelCard>
      <TreeItem :data="storeState" />
    </DevtoolPanelCard>
  </DevtoolPanelContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import DevtoolPanelCard from './ui/DevtoolPanelCard.vue';
import DevtoolPanelContainer from './ui/DevtoolPanelContainer.vue';
import DevtoolPanelToolbar from './ui/DevtoolPanelToolbar.vue';

import { snapshotGlobalStore } from '@hungpvq/shared-log';
import { BaseButton, TreeItem } from '@hungpvq/vue-ui-core';
import {
  phaseLabel,
  runWithPhase,
  type ActionFeedbackPhase,
} from './feedback.js';


const storeState = shallowRef<Record<string, unknown>>({});
const refreshPhase = ref<ActionFeedbackPhase>('idle');

const refreshLabel = computed(() => phaseLabel(refreshPhase.value, 'Refresh'));

function refreshQuiet() {
  storeState.value = snapshotGlobalStore();
}

async function onRefresh() {
  await runWithPhase((phase) => {
    refreshPhase.value = phase;
  }, refreshQuiet);
}

let pollTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  refreshQuiet();
  pollTimer = setInterval(refreshQuiet, 1000);
});

onUnmounted(() => {
  if (pollTimer != null) {
    clearInterval(pollTimer);
    pollTimer = undefined;
  }
});
</script>
