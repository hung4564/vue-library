<template>
  <DevtoolsControl v-bind="props" />
</template>

<script setup lang="ts">
import type { WithMapPropType } from '@hungpvq/map-core';
import type { WithShowProps } from '@hungpvq/vue-map-core';

import { defineProps, withDefaults } from 'vue';
import DevtoolsControl from './DevtoolsControl.vue';

/**
 * Map Devtools panel — mount **inside** `<Map>` (uses `DraggableItemPopup`).
 */
const props = withDefaults(
  defineProps<Partial<WithMapPropType & WithShowProps>>(),
  {
    show: false,
    position: 'bottom-right',
  },
);
</script>

<style>
@import '../style.css';
</style>
