<template>
  <button
    type="button"
    class="map-control__button clickable"
    v-bind="$attrs"
    :disabled="props.disabled"
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
