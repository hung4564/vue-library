<script lang="ts">
export default { name: 'BaseButton' };
</script>
<script setup lang="ts">
import { computed } from 'vue';

import {
  type UiButtonSize,
  type UiButtonVariant,
  uiButtonBindStyle,
  uiButtonSizeClass,
  uiButtonVariantClass,
} from './ui-button';

const props = withDefaults(
  defineProps<{
    /** icon | plain | text | tonal | outlined | filled. Default `text`. */
    variant?: UiButtonVariant;
    /** small | medium | large | number (px). Applies to every variant. */
    size?: UiButtonSize | string;
    active?: boolean;
    disabled?: boolean;
    loading?: boolean;
    title?: string;
  }>(),
  {
    variant: 'text',
    size: 'medium',
    active: false,
    disabled: false,
    loading: false,
  },
);

const buttonClass = computed(() => [
  uiButtonVariantClass(props.variant),
  uiButtonSizeClass(props.size),
  {
    'ui-btn--active': props.active,
    'ui-btn--disabled': props.disabled,
  },
]);

const buttonStyle = computed(() =>
  uiButtonBindStyle(props.variant, props.size),
);
</script>
<template>
  <button
    type="button"
    class="ui-btn"
    :class="buttonClass"
    :style="buttonStyle"
    :disabled="disabled || loading"
    :title="title"
    :aria-pressed="active"
    :aria-busy="loading || undefined"
  >
    <span class="ui-btn__content">
      <span
        v-if="loading"
        class="ui-btn__spin"
        aria-hidden="true"
      />
      <slot v-else />
    </span>
  </button>
</template>
