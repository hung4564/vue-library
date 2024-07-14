<template>
  <div class="form-group">
    <label v-if="label">
      {{ label }}
    </label>
    <div class="input-container">
      <Sketch
        :modelValue="form"
        v-bind="$attrs"
        @update:modelValue="onSetValue"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sketch } from '@ckpack/vue-color';
const form = defineModel({ default: '#000000' });
defineProps({
  label: String,
  disabled: Boolean,
});
const emit = defineEmits(['change']);
function onSetValue({ hex }) {
  form.value = hex;
  emit('change', hex);
}
</script>
