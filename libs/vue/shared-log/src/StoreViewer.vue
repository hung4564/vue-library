<template>
  <div class="store-viewer">
    <div class="store-viewer__toolbar">
      <BaseButton
        title="Refresh store snapshot"
        :disabled="refreshPhase === 'loading'"
        @click="onRefresh"
      >
        {{ refreshLabel }}
      </BaseButton>
    </div>
    <div class="store-viewer__body">
      <TreeItem :data="storeState" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue';

import { snapshotGlobalStore } from '@hungpvq/shared-log';
import { BaseButton } from '@hungpvq/vue-ui-core';
import { phaseLabel, runWithPhase, type ActionFeedbackPhase } from './feedback';
import TreeItem from './TreeItem.vue';

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
