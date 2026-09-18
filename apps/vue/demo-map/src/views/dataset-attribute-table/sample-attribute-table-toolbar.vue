<script setup lang="ts">
import { ATTRIBUTE_TABLE_COMPONENT_KEY } from '@hungpvq/map-dataset/attribute-table';
import type { AttributeTableToolbarProps } from '@hungpvq/map-dataset/attribute-table';
import { AttributeTableToolbar } from '@hungpvq/vue-map-dataset';

defineOptions({ name: 'SampleAttributeTableToolbar' });

const props = defineProps<AttributeTableToolbarProps>();
</script>

<template>
  <div class="sample-at-part">
    <div class="sample-at-part__banner sample-at-part__banner--toolbar">
      <code>{{ ATTRIBUTE_TABLE_COMPONENT_KEY.toolbar }}</code>
    </div>
    <AttributeTableToolbar v-bind="props" />
  </div>
</template>

<style scoped>
.sample-at-part {
  display: flex;
  flex-direction: column;
}
.sample-at-part__banner {
  padding: 4px 10px;
  font-size: 11px;
  border-bottom: 1px solid #f0c98a;
  background: #fff4e6;
  color: #4a2c0a;
}
.sample-at-part__banner code {
  font-size: 10px;
}
</style>
