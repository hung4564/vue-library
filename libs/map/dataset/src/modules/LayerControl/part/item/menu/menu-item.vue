<template lang="">
  <button v-bind="$attrs" class="menu-item" :title="item.name">
    <template v-if="item.icon">
      <SvgIcon size="14" type="mdi" :path="item.icon"
    /></template>
  </button>
</template>
<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon';
import type { IListViewUI, MenuAction } from '../../../../../interfaces';

const props = defineProps<{
  item: MenuAction<IListViewUI>;
  data: IListViewUI;
}>();
</script>
<style lang=""></style>
