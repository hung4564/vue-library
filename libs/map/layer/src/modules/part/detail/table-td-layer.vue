<template>
  <TableTdCopy :value="value">
    <template v-if="!field.inline">
      <td style="min-width: 60px">
        {{ label }}
      </td>
      <td>
        {{ value }}
      </td>
    </template>
    <td colspan="2" v-else>
      <input-text-area readonly rows="10" v-model="value" :label="label" />
    </td>
  </TableTdCopy>
</template>
<script setup>
import { InputTextArea } from '@hungpvq/vue-map-core';
import { computed } from 'vue';
import { getLayerFromView } from '../../..//helper';
import TableTdCopy from './table-td-copy.vue';
const props = defineProps({
  label: String,
  layer: {},
  field: {},
});
const layer = getLayerFromView(props.layer);
const value = computed(() =>
  props.field.value instanceof Function
    ? props.field.value(layer)
    : layer[props.field.value]
);
</script>
<style scoped>
tr {
  padding: 0 16px;
}
tr .btn-copy {
  display: none;
}
tr:hover .btn-copy {
  display: block;
}
</style>
