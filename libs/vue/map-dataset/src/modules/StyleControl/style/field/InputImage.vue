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
<style scoped>
.fill-canvas {
  background-image:
    linear-gradient(-45deg, transparent 75%, rgba(0, 0, 0, 0.06) 75%),
    linear-gradient(45deg, transparent 75%, rgba(0, 0, 0, 0.06) 75%),
    linear-gradient(45deg, rgba(0, 0, 0, 0.06) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(0, 0, 0, 0.06) 25%, transparent 25%);
  background-size: 12px 12px;
  background-position:
    0 0,
    0 -6px,
    6px 0,
    -6px -6px;
}
.map-theme-dark .fill-canvas {
  background-image:
    linear-gradient(-45deg, transparent 75%, rgba(32, 43, 54, 0.9) 75%),
    linear-gradient(45deg, transparent 75%, rgba(32, 43, 54, 0.9) 75%),
    linear-gradient(45deg, rgba(32, 43, 54, 0.9) 25%, transparent 0),
    linear-gradient(-45deg, rgba(32, 43, 54, 0.9) 25%, transparent 25%);
  background-position:
    0 0,
    0 -6px,
    6px 0,
    -6px -6px;
  background-size: 12px 12px;
}
</style>
<style scoped>
.fill-canvas {
  padding: 8px;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(26px, 1fr));
  gap: 4px;
}
.item-icon {
  border: 2px transparent solid;
  box-sizing: border-box;
  border-radius: 4px;
  position: relative;
  width: 100%;
  padding-top: 100%;
}
.input-image {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.item-icon .item-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.item-icon .item-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.item-icon-active {
  border-color: var(--v-primary-base, #1a73e8);
}
</style>
