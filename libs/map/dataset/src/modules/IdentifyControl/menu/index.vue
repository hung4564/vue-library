<template lang="">
  <component :is="component" :item="item" v-bind="$attrs" />
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { MenuAction } from '../../../interfaces/dataset.parts';
import MenuDivider from './menu-divider.vue';
import MenuItem from './menu-item.vue';
const props = defineProps<{
  item: MenuAction;
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
