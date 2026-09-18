<template>
  <MapControlButton
    size="small"
    v-bind="$attrs"
    class="menu-item"
    :title="title"
    variant="plain"
  >
    <SvgIcon v-if="icon" size="14" type="mdi" :path="icon" />
    <span v-else>{{ title }}</span>
  </MapControlButton>
</template>
<script setup lang="ts">
import type { MenuAction } from '@hungpvq/map-dataset/menu';
import { MapControlButton } from '@hungpvq/vue-map-core';
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
