<template lang="">
  <BaseButton v-bind="$attrs" class="menu-item" :title="item.name">
    <template v-if="item.icon">
      <SvgIcon size="14" type="mdi" :path="item.icon"
    /></template>
  </BaseButton>
</template>
<script setup lang="ts">
import type { IListViewUI, MenuAction } from '@hungpvq/map-dataset';
import { BaseButton } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';

const props = defineProps<{
  item: MenuAction<IListViewUI>;
}>();
</script>
