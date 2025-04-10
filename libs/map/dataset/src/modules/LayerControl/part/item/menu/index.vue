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
import { IListView, type Menu } from '@hungpvq/vue-map-core';
import { computed } from 'vue';
import MenuItem from './menu-item.vue';
import MenuDivider from './menu-divider.vue';
const props = defineProps<{ item: Menu; data: IListView; mapId: string }>();
const component = computed(() => {
  switch (props.item.type) {
    case 'divider':
      return MenuDivider;
  }
  return MenuItem;
});
</script>
<style lang=""></style>
