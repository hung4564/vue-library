<template lang="">
  <div v-bind="$attrs" class="input-image">
    <div>
      <InputText :modelValue="form" @change="onSetValue($event.target.value)" />
    </div>
    <div class="fill-canvas">
      <div
        v-for="(styleImage, name) in images"
        :key="name"
        class="item-icon"
        :class="{ 'item-icon-active': name == form }"
      >
        <div class="item-image">
          <img
            :src="toDataURL(name, styleImage)"
            alt="Map image"
            @click="onSetValue(name)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { InputText, useMapImages } from '@hungpvq/vue-map-core';
const form = defineModel<string | undefined>({ default: undefined });
const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  mapId: {
    type: String,
    required: true,
  },
});
const { images, toDataURL } = useMapImages(props.mapId);
function onSetValue(value: string) {
  emit('update:modelValue', value == form.value ? undefined : value);
}
</script>
