<template>
  <div class="layer-detail-row">
    <div class="layer-detail-row__copy">
      <MapCopyButton :value="value == null ? '' : String(value)" />
    </div>
    <slot />
  </div>
</template>
<script setup>
import { MapCopyButton } from '@hungpvq/vue-map-core';

defineProps({
  value: {},
});
</script>
