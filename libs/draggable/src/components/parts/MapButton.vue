<template>
  <button
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

<style lang="scss" scoped>
.hungpvq-draggable-button {
  cursor: pointer;
  pointer-events: all;
  border-style: none;
  background-color: transparent;
  font-size: 0.625rem;
  align-items: center;
  border-radius: 4px;
  display: inline-flex;
  flex: 0 0 auto;
  font-weight: 500;
  letter-spacing: 0.0892857143em;
  justify-content: center;
  outline: 0;
  position: relative;
  text-decoration: none;
  text-indent: 0.0892857143em;
  text-transform: none;
  transition-duration: 0.28s;
  transition-property: box-shadow, transform, opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;
  border-radius: 50%;
  min-height: 0;
  min-width: 0;
  padding: 0;

  &__content {
    align-items: center;
    color: inherit;
    display: flex;
    flex: 1 0 auto;
    justify-content: inherit;
    line-height: normal;
    position: relative;
    transition: inherit;
    transition-property: opacity;
  }
  &--disabled {
    color: rgba(0, 0, 0, 0.26) !important;
    pointer-events: none;
  }
}
</style>
