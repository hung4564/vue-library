<template lang="">
  <div v-bind="$attrs" class="input-array-index">
    <div
      class="input-array-item"
      v-for="(arr, index) in items"
      :key="`array_${index}`"
    >
      <span> {{ arr.text }}: </span>
      <InputText
        :modelValue="form[index]"
        :type="arr.type"
        @change="onSetValue(+$event.target.value, index)"
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
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
});
function onSetValue(value: number, index: number) {
  form.value[index] = value;
  emit('update:modelValue', form.value);
}
</script>
<style scoped>
.input-array-index {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.input-array-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
</style>
