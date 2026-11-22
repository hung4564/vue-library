<template>
  <MapRangeSlider
    class="layer-item-slider"
    :model-value="modelValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
<script setup lang="ts">
import { MapRangeSlider } from '@hungpvq/vue-map-core/fields';

withDefaults(
  defineProps<{
    modelValue?: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
  }>(),
  {
    modelValue: 0,
    min: 0,
    max: 1,
    step: 0.01,
    disabled: false,
  },
);

defineEmits<{
  'update:modelValue': [value: number];
}>();
</script>
