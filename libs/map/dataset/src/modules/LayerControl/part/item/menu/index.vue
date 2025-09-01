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
import { computed } from 'vue';
import type { MenuAction } from '../../../../../interfaces';
import type { IListViewUI } from '../../../../../model';
import { useUniversalRegistry } from '../../../../../registry';
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
<style lang=""></style>
