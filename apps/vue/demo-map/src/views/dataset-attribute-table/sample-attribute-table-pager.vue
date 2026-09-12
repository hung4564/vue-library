<script setup lang="ts">
import { ATTRIBUTE_TABLE_COMPONENT_KEY } from '@hungpvq/map-dataset/attribute-table';
import type { AttributeTablePagerProps } from '@hungpvq/map-dataset/attribute-table';
import { AttributeTablePager } from '@hungpvq/vue-map-dataset';

defineOptions({ name: 'SampleAttributeTablePager' });

const props = defineProps<AttributeTablePagerProps>();
</script>

<template>
  <div class="sample-at-part">
    <div class="sample-at-part__banner sample-at-part__banner--pager">
      <code>{{ ATTRIBUTE_TABLE_COMPONENT_KEY.pager }}</code>
      ·
      <code
        >list({ intent: 'page', page: {{ props.page }}, pageSize:
        {{ props.pageSize }} })</code
      >
    </div>
    <AttributeTablePager v-bind="props" />
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
  border-top: 1px solid #c5daf0;
  background: #eef5fc;
  color: #1a3a5c;
}
.sample-at-part__banner code {
  font-size: 10px;
}
</style>
