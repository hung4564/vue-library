<template lang="">
  <BaseButton v-bind="$attrs" class="menu-item" :title="item.name">
    <template v-if="item.icon">
      <SvgIcon size="14" type="mdi" :path="item.icon"
    /></template>
  </BaseButton>
</template>
<script setup lang="ts">
import { BaseButton } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import type { IListViewUI, MenuAction } from '../../../../../interfaces';

const props = defineProps<{
  item: MenuAction<IListViewUI>;
}>();
</script>
<style lang=""></style>
