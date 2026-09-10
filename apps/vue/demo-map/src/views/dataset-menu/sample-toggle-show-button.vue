<template>
  <MapControlButton
    :disabled="disabled"
    :title="title"
    :active="show"
    @click.stop="emit('toggle')" variant="text">
    <span class="sample-toggle-show-button__label">
      {{ show ? 'ON' : 'OFF' }}
    </span>
  </MapControlButton>
</template>
<script setup lang="ts">
import { MapControlButton } from '@hungpvq/vue-map-core';

defineOptions({ name: 'SampleToggleShowButton' });

defineProps<{
  show: boolean;
  disabled?: boolean;
  title: string;
}>();

const emit = defineEmits<{
  toggle: [];
}>();
</script>
<style scoped>
.sample-toggle-show-button__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
}
</style>
