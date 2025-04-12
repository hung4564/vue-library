<template lang="">
  <component :is="component" :item="item" :data="data" v-bind="$attrs" />
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { IListViewUI, MenuAction } from '../../../../../interfaces';
import MenuDivider from './menu-divider.vue';
import MenuItem from './menu-item.vue';
const props = defineProps<{
  item: MenuAction<IListViewUI>;
  data: IListViewUI;
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
