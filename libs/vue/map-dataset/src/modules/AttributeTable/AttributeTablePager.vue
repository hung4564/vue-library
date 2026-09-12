<script lang="ts">
export default { name: 'attribute-table-pager' };
</script>
<script setup lang="ts">
import {
  ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS,
  type AttributeTablePagerProps,
} from '@hungpvq/map-dataset/attribute-table';
import { MapControlButton } from '@hungpvq/vue-map-core';
import { InputSelect } from '@hungpvq/vue-map-core/fields';
import { computed } from 'vue';

const props = defineProps<AttributeTablePagerProps>();

const pageSizeItems = computed(() =>
  props.pageSizeItems?.length
    ? props.pageSizeItems
    : [...ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS],
);
const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (value) => {
    props.onPageSizeChange(value as string | number);
  },
});
const visible = computed(() => props.total > 0);
</script>
<template>
  <div v-if="visible" class="attribute-table__pager">
    <span class="attribute-table__pager-label">
      {{ props.pageLabel }} {{ props.page }} {{ props.ofLabel }}
      {{ props.totalPages }}
    </span>
    <MapControlButton
      class="attribute-table__pager-btn"
      :disabled="!props.canPrev || props.loading"
      variant="outlined"
      size="medium"
      @click="props.onPrev()"
    >
      {{ props.prevLabel }}
    </MapControlButton>
    <MapControlButton
      class="attribute-table__pager-btn"
      :disabled="!props.canNext || props.loading"
      variant="outlined"
      size="medium"
      @click="props.onNext()"
    >
      {{ props.nextLabel }}
    </MapControlButton>
    <div class="attribute-table__pager-size">
      <span class="attribute-table__pager-size-label">{{
        props.rowsPerPageLabel
      }}</span>
      <InputSelect
        v-model="pageSizeModel"
        :items="pageSizeItems"
        item-value="value"
        item-text="text"
        :label="props.rowsPerPageLabel"
      />
    </div>
  </div>
</template>
