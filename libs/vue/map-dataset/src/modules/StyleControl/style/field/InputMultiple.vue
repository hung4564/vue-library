<template lang="">
  import { MapControlButton } from '@hungpvq/vue-map-core';
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
        <map-control-button
          @click="onRemove(form, index)"
          v-if="form.length > 2"
          variant="text"
        >
          <SvgIcon size="16" type="mdi" :path="path.delete" />
        </map-control-button>
      </div>
    </div>
    <map-control-button @click="onAdd()" variant="text">
      Add</map-control-button
    >
  </div>
</template>
<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiDelete } from '@mdi/js';
const form = defineModel<number[]>({ default: () => [0, 0] });
const emit = defineEmits(['update:modelValue']);

const path = {
  delete: mdiDelete,
};
defineProps({
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
