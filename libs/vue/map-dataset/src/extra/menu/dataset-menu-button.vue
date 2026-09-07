<template>
  <component
    :is="component"
    :item="item"
    :data="data"
    :mapId="mapId"
    :location="itemLocation"
    :disabled="disabled"
    v-bind="$attrs"
  />
</template>
<script setup lang="ts">
import type { IDataset, MenuAction } from '@hungpvq/map-dataset';
import { getMenuItemLocation } from '@hungpvq/map-dataset';
import { useUniversalRegistry } from '@hungpvq/vue-map-core';
import { computed } from 'vue';
import DatasetMenuDivider from './dataset-menu-divider.vue';
import DatasetMenuItem from './dataset-menu-item.vue';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  item: MenuAction;
  data?: IDataset;
  mapId?: string;
  disabled?: boolean;
}>();

const { getComponent } = useUniversalRegistry(props.mapId);
const itemLocation = computed(() => getMenuItemLocation(props.item));
const component = computed(() => {
  if (props.item.type === 'divider') return DatasetMenuDivider;
  if (props.item.type === 'item' && 'componentKey' in props.item && props.mapId) {
    return getComponent(props.item.componentKey) || DatasetMenuItem;
  }
  return DatasetMenuItem;
});
</script>
