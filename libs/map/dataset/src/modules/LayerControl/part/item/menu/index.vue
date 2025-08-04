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
import MenuDivider from './menu-divider.vue';
import MenuItem from './menu-item.vue';
const props = defineProps<{
  item: MenuAction<IListViewUI>;
  data: IListViewUI;
  mapId: string;
}>();
const component = computed(() => {
  switch (props.item.type) {
    case 'divider':
      return MenuDivider;
  }
  if (props.item.type == 'item' && 'component' in props.item) {
    return props.item.component();
  }
  return MenuItem;
});
</script>
<style lang=""></style>
