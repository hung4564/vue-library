<template lang="">
  <component
    :is="component"
    :item="item"
    :data="data"
    v-bind="$attrs"
    :mapId="mapId"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type {
  IIdentifyView,
  MenuAction,
} from '../../../interfaces/dataset.parts';
import MenuDivider from './menu-divider.vue';
import MenuItem from './menu-item.vue';
const props = defineProps<{
  item: MenuAction;
  data: IIdentifyView;
  mapId: string;
}>();
const component = computed(() => {
  switch (props.item.type) {
    case 'divider':
      return MenuDivider;
  }
  return MenuItem;
});
</script>
<style lang=""></style>
