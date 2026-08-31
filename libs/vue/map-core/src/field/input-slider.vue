<template>
  <div class="form-group">
    <label v-if="label">
      {{ label }}
    </label>
    <div class="input-container">
      <input
        v-model="form"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :style="{ backgroundSize: backgroundSize }"
        :disabled="disabled"
      />
      <div class="input-slider__value">
        <input
          v-model="form"
          type="number"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

const form = defineModel<number>({ default: 0 });
const props = defineProps({
  label: String,
  min: {
    default: 0,
  },
  max: {
    default: 100,
  },
  step: {
    default: 1,
  },
  disabled: Boolean,
});
const backgroundSize = computed(() => {
  return ((form.value - props.min) * 100) / (props.max - props.min) + '% 100%';
});
</script>
