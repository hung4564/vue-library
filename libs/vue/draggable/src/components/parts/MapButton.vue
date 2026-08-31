<template>
  <button
    type="button"
    class="hungpvq-draggable-button"
    v-bind="$attrs"
    :style="bindStyle"
    :class="bindClass"
  >
    <span class="hungpvq-draggable-button__content">
      <slot />
    </span>
  </button>
</template>

<script>
export default {
  name: 'MapButton',
  props: { height: { default: 32 }, width: { default: 32 }, disabled: Boolean },
  computed: {
    bindStyle() {
      return { width: `${this.width}px`, height: `${this.height}px` };
    },
    bindClass() {
      return { 'hungpvq-draggable-button--disabled': this.disabled };
    },
  },
};
</script>
