<template>
  <button
    type="button"
    class="map-control__button clickable"
    v-bind="$attrs"
    :class="{
      'map-control__button-active': props.active,
      'map-control__button-disabled': props.disabled,
    }"
  >
    <slot />
  </button>
</template>
<script lang="ts">
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'BaseButton',
};
</script>
<script setup lang="ts">
const props = defineProps({ active: Boolean, disabled: Boolean });
</script>
<style scoped>
.map-control__button {
  display: inline-flex;
  min-width: 20px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  box-shadow: unset;
  outline: none;
  border: none;
}
.map-control__button-active {
  color: var(--v-primary-base, #1a73e8) !important;
}
.map-control__button-disabled {
  pointer-events: none;
  cursor: none;
  opacity: 0.8;
}
</style>
