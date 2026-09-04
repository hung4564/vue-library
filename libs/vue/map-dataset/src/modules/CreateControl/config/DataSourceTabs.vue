<template>
  <div class="create-control-data">
    <div class="create-control-data__tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        role="tab"
        class="create-control-data__tab"
        :class="{ _active: activeTab === tab }"
        :aria-selected="activeTab === tab"
        @click="activeTab = tab"
      >
        {{ tabLabel(tab) }}
      </button>
    </div>
    <div class="create-control-data__panel" role="tabpanel">
      <slot v-if="activeTab === 'file'" name="file" />
      <slot v-if="activeTab === 'raw'" name="raw" />
      <slot v-if="activeTab === 'url'" name="url" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CreateControlDataTab } from '@hungpvq/map-dataset';
import { CREATE_CONTROL_DEFAULT_DATA_TAB } from '@hungpvq/map-dataset';
import { useLang, useMap } from '@hungpvq/vue-map-core';
import { watch } from 'vue';

const props = defineProps<{
  tabs: CreateControlDataTab[];
}>();

const activeTab = defineModel<CreateControlDataTab>('activeTab', { required: true });

const { mapId } = useMap();
const { trans } = useLang(mapId.value);

watch(
  () => props.tabs,
  (tabs) => {
    if (!tabs.includes(activeTab.value)) {
      activeTab.value = CREATE_CONTROL_DEFAULT_DATA_TAB;
    }
  },
  { immediate: true },
);

function tabLabel(tab: CreateControlDataTab) {
  return trans.value(`map.layer-control.create.tab-${tab}`);
}
</script>
