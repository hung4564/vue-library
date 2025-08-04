<template lang="">
  <div class="menu-divider"></div>
</template>
<script setup lang="ts">
import type { MenuAction } from '../../../../../interfaces';
import type { IListViewUI } from '../../../../../model';
defineProps<{
  item: MenuAction<IListViewUI>;
  data: IListViewUI;
}>();
</script>
<style scoped>
.menu-divider {
  border-left: 1px solid currentColor;
  height: 75%;
  width: 0px;
  padding: 0px;
  margin: 4px;
  min-width: unset;
}
</style>
