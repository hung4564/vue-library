<template lang="">
  <div v-bind="$attrs" class="input-array-x-y">
    <div class="input-array-item">
      <span> x: </span>
      <InputText
        :modelValue="form[0]"
        type="number"
        @change="onSetValue(+$event.target.value, 0)"
      />
    </div>
    <div class="input-array-item">
      <span> y: </span>
      <InputText
        :modelValue="form[1]"
        type="number"
        @change="onSetValue(+$event.target.value, 1)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { InputText } from '@hungpvq/vue-map-core';
const form = defineModel<number[]>({ default: () => [] });
const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  mapId: {
    type: String,
    required: true,
  },
});
function onSetValue(value: number, index: number) {
  form.value[index] = value;
  emit('update:modelValue', form.value);
}
</script>
<style scoped>
.input-array-x-y {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.input-array-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
