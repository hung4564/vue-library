<template lang="">
  <div class="menu-divider"></div>
</template>
<script setup lang="ts">
import { IListView, MenuItem } from '@hungpvq/vue-map-core';
defineProps<{ item: MenuItem; data: IListView }>();
</script>
<style>
.layer-control .layer-item__button.menu-divider {
  border-left: 1px solid currentColor;
  height: 75%;
  width: 0px;
  padding: 0px;
  margin: 4px;
  min-width: unset;
}
</style>
