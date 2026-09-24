<template>
  <div v-if="mapIds.length > 1" class="devtools-map-filter" @pointerdown.stop>
    <InputSelect
      :model-value="filterMapId"
      :items="items"
      aria-label="Filter by mapId"
      @update:model-value="onChange"
    />
  </div>
</template>

<script setup lang="ts">
import { listMapIds, shortMapId } from '@hungpvq/map-debug';
import { InputSelect } from '@hungpvq/vue-map-core/fields';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { setDevtoolFilterMapId, useDevtoolState } from '../store';

const ALL = 'all';

const { filterMapId } = useDevtoolState();
const mapIds = ref<string[]>([]);

const items = computed(() => [
  { value: ALL, text: 'All maps' },
  ...mapIds.value.map((id) => ({ value: id, text: shortMapId(id) })),
]);

function refresh() {
  mapIds.value = listMapIds();
}

function onChange(value: string | number | boolean | null | undefined) {
  setDevtoolFilterMapId(String(value ?? ALL));
}

watch(mapIds, (ids) => {
  if (filterMapId.value !== ALL && !ids.includes(filterMapId.value)) {
    setDevtoolFilterMapId(ALL);
  }
});

let pollTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  refresh();
  pollTimer = setInterval(refresh, 1000);
});

onUnmounted(() => {
  if (pollTimer != null) {
    clearInterval(pollTimer);
    pollTimer = undefined;
  }
});
</script>
