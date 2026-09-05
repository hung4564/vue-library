<template lang="">
  <component
    :is="component"
    :item="item"
    :data="data"
    :mapId="mapId"
    v-bind="$attrs"
  />
</template>
<script setup lang="ts">
import type { IListViewUI, MenuAction } from '@hungpvq/map-dataset';
import { useUniversalRegistry } from '@hungpvq/vue-map-core';
import { computed } from 'vue';
import MenuDivider from './menu-divider.vue';
import MenuItem from './menu-item.vue';
const props = defineProps<{
  item: MenuAction<IListViewUI>;
  data: IListViewUI;
  mapId: string;
}>();
const { getComponent } = useUniversalRegistry(props.mapId);
const component = computed(() => {
  switch (props.item.type) {
    case 'divider':
      return MenuDivider;
  }
  if (props.item.type == 'item' && 'componentKey' in props.item) {
    return getComponent(props.item.componentKey);
  }
  return MenuItem;
});
</script>
