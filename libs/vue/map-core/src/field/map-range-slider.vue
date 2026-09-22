<template>
  <input
    class="map-range-slider"
    type="range"
    :value="modelValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :style="{ backgroundSize }"
    :aria-label="ariaLabel"
    @input="onInput"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    ariaLabel?: string;
  }>(),
  {
    modelValue: 0,
    min: 0,
    max: 1,
    step: 0.01,
    disabled: false,
    ariaLabel: undefined,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const backgroundSize = computed(() => {
  const span = props.max - props.min;
  if (span <= 0) return '0% 100%';
  return `${((props.modelValue - props.min) * 100) / span}% 100%`;
});

function onInput(event: Event) {
  const value = parseFloat((event.target as HTMLInputElement).value);
  emit('update:modelValue', Number.isFinite(value) ? value : props.min);
}
</script>
