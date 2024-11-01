<template lang="">
  <component
    :is="tag"
    vBtn
    :data-appearance="color"
    :data-variant="variant"
    type="button"
    :class="classes"
    :style="styles"
    :aria-busy="loading ? true : undefined"
    :disabled="isDisabled || undefined"
    :tabindex="loading || readonly ? -1 : undefined"
    @click="onClick"
  >
    <span class="v-btn__content" data-no-activator="">
      <slot />
    </span>
  </component>
</template>
<script lang="ts">
export default {
  name: 'VBtn',
};
</script>
<script lang="ts" setup>
import { propsFactory } from '@hungpvq/shared';
import { computed } from 'vue';
import { makeComponentProps } from '../../composables/component';
import { makeLoaderProps, useLoader } from '../../composables/loader';
import { makeRoundedProps, useRounded } from '../../composables/rounded';
import { makeSizeProps, useSize } from '../../composables/size';
import { makeTagProps } from '../../composables/tag';
import { makeVariantProps, useVariant } from '../../composables/variant';

const props = defineProps(
  propsFactory(
    {
      disabled: Boolean,
      readonly: Boolean,
      ...makeComponentProps(),
      ...makeLoaderProps(),
      ...makeVariantProps(),
      ...makeSizeProps(),
      ...makeRoundedProps(),
      ...makeTagProps({ tag: 'button' }),
    },
    'VBtn'
  )()
);
defineSlots<{ default: () => any }>();
const emit = defineEmits({
  click: (e: MouseEvent) => true,
});
const isDisabled = computed(() => props.disabled);
const { loaderClasses } = useLoader(props);
const { colorClasses, colorStyles, variantClasses } = useVariant(props);
const { roundedClasses } = useRounded(props);
function onClick(e: MouseEvent) {
  if (isDisabled.value) return;
  emit('click', e);
}
const { sizeClasses, sizeStyles } = useSize(props);
const classes = computed(() => [
  'v-btn',
  {
    'v-btn--disabled': isDisabled.value,
    'v-btn--loading': props.loading,
    'v-btn--readonly': props.readonly,
  },
  sizeClasses.value,
  colorClasses.value,
  loaderClasses.value,
  variantClasses.value,
  roundedClasses.value,
  props.class,
]);
const styles = computed(() => [
  colorStyles.value,
  sizeStyles.value,
  props.style,
]);
</script>
<style lang="scss" scoped>
@import '../../styles/local/main-local';
.v-btn {
  @include button-clear();
  @at-root {
    @include button-sizes();
    @include variant();
  }
  position: relative;
  align-items: center;
  display: inline-grid;
  grid-template-areas: 'prepend content append';
  grid-template-columns: max-content auto max-content;
  justify-content: center;
  outline: none;
  position: relative;
  text-decoration: none;
  user-select: none;
  flex-shrink: 0;
  box-sizing: border-box;
}
</style>
