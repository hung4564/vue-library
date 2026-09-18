<template>
  <div class="store-viewer">
    <div class="store-viewer__toolbar">
      <InputSelect
        v-if="mapSelectItems.length > 1"
        v-model="selectedMapId"
        :items="mapSelectItems"
        aria-label="Filter by mapId"
      />
      <MapControlButton variant="text" size="small" @click="refresh">
        Refresh
      </MapControlButton>
    </div>
    <div class="store-viewer__body">
      <TreeItem :data="storeState" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  listMapIds,
  shortMapId,
  snapshotGlobalStore,
  snapshotMapScopedStore,
} from '@hungpvq/map-debug';
import { MapControlButton } from '@hungpvq/vue-map-core';
import { InputSelect } from '@hungpvq/vue-map-core/fields';
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import TreeItem from './TreeItem.vue';

const ALL = 'all';

const selectedMapId = ref(ALL);
const mapIds = ref<string[]>([]);
const storeState = shallowRef<Record<string, unknown>>({});

const mapSelectItems = computed(() => [
  { value: ALL, text: 'All / global' },
  ...mapIds.value.map((id) => ({ value: id, text: shortMapId(id) })),
]);

const refresh = () => {
  mapIds.value = listMapIds();
  if (
    selectedMapId.value !== ALL &&
    !mapIds.value.includes(selectedMapId.value)
  ) {
    selectedMapId.value = ALL;
  }
  storeState.value =
    selectedMapId.value === ALL
      ? snapshotGlobalStore()
      : snapshotMapScopedStore(selectedMapId.value);
};

watch(selectedMapId, () => {
  storeState.value =
    selectedMapId.value === ALL
      ? snapshotGlobalStore()
      : snapshotMapScopedStore(selectedMapId.value);
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
