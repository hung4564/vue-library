<template>
  <TableTdCopy :value="value">
    <template v-if="!field.inline">
      <div class="layer-detail-grid">
        <div class="layer-detail-grid__label" :title="label">
          {{ label }}
        </div>
        <div class="layer-detail-grid__value">
          {{ value }}
        </div>
      </div>
    </template>
    <div class="layer-detail-grid layer-detail-grid--full" v-else>
      <input-text-area readonly rows="10" v-model="value" :label="label" />
    </div>
  </TableTdCopy>
</template>
<script setup>
import { InputTextArea } from '@hungpvq/vue-map-core';
import { computed } from 'vue';
import TableTdCopy from './table-td-copy.vue';
const props = defineProps({
  item: {},
  view: {},
  field: {},
  label: {},
});
const value = computed(() => (props.item ? props.item[props.field.value] : ''));
</script>
