<template>
  <div class="map-row create-control-settings">
    <SourceLayerOptions
      :options="options"
      empty-hint-key="map.layer-control.create.file-hint-filegdb"
      @update:options="onOptions"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';

import SourceLayerOptions from './source-layer-options.vue';

const form = defineModel();

const options = computed(() =>
  Array.isArray(form.value?.sourceLayerOptions)
    ? form.value.sourceLayerOptions
    : [],
);

function onOptions(next) {
  form.value.sourceLayerOptions = next;
  form.value.sourceLayers = next.filter((o) => o.enabled).map((o) => o.id);
}
</script>
