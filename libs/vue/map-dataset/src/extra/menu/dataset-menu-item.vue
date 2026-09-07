<template>
  <BaseButton v-bind="$attrs" class="menu-item" :title="title">
    <SvgIcon v-if="icon" size="14" type="mdi" :path="icon" />
    <span v-else>{{ title }}</span>
  </BaseButton>
</template>
<script setup lang="ts">
import type { MenuAction } from '@hungpvq/map-dataset';
import { BaseButton } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { computed } from 'vue';

const props = defineProps<{
  item: MenuAction;
}>();

const title = computed(() =>
  'name' in props.item ? props.item.name : undefined,
);
const icon = computed(() =>
  'icon' in props.item ? props.item.icon : undefined,
);
</script>
