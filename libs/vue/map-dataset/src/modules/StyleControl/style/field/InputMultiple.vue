<template lang="">
  <div v-bind="$attrs" class="input-array-index">
    <div
      class="input-array-item"
      v-for="(arr, index) in form"
      :key="`array_${index}`"
    >
      <InputText
        :modelValue="form[index]"
        :type="arr.type"
        @change="onSetValue(+$event.target.value, index)"
      />
      <div class="input-array-item__action">
        <base-button @click="onRemove(form, index)" v-if="form.length > 2">
          <SvgIcon size="16" type="mdi" :path="path.delete" />
        </base-button>
      </div>
    </div>
    <base-button @click="onAdd()"> Add</base-button>
  </div>
</template>
<script setup lang="ts">
import { BaseButton, InputText } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiDelete } from '@mdi/js';
const form = defineModel<number[]>({ default: () => [0, 0] });
const emit = defineEmits(['update:modelValue']);

const path = {
  delete: mdiDelete,
};
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
function onRemove(array: number[], index: number) {
  if (array) array.splice(index, 1);
  form.value = array;
  emit('update:modelValue', array);
}
function onAdd() {
  form.value.push(0);
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
  gap: 4px;
  align-content: center;
}
.input-array-item__action {
  display: flex;
  align-content: center;
}
</style>
