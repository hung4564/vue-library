<template lang="">
  <div class="menu-divider"></div>
</template>
<script setup lang="ts">
import type { IListViewUI, MenuAction } from '@hungpvq/map-dataset';
defineProps<{
  item: MenuAction<IListViewUI>;
  data: IListViewUI;
}>();
</script>
