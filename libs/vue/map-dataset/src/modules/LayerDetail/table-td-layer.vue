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
    <div class="grid-row grid-row-full" v-else>
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
