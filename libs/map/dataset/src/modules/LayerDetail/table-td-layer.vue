<template>
  <TableTdCopy :value="value">
    <template v-if="!field.inline">
      <div class="grid-row">
        <div class="label-cell" :title="label">
          {{ label }}
        </div>
        <div class="value-cell">
          {{ value }}
        </div>
      </div>
    </template>
    <div class="grid-row" v-else>
      <input-text-area readonly rows="10" v-model="value" :label="label" />
    </div>
  </TableTdCopy>
</template>
<script setup>
import { InputTextArea } from '@hungpvq/vue-map-core';
import { computed } from 'vue';
import TableTdCopy from './table-td-copy.vue';
const props = defineProps({
  label: String,
  layer: {},
  field: {},
});
const value = computed(() =>
  props.layer ? props.layer[props.field.value] : ''
);
</script>
<style scoped>
.grid-row {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  width: 100%;
  align-items: center;
  min-height: 40px;
}

.label-cell {
  flex: 0 0 100px;
  white-space: nowrap;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}

.value-cell {
  flex: 1;
  white-space: normal;
  word-break: break-word;
  min-width: 0;
}
</style>
