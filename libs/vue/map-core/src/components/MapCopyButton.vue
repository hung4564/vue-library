<template>
  <MapControlButton
    v-bind="$attrs"
    :variant="variant"
    :size="size"
    :disabled="isDisabled"
    :title="copied ? copiedTitle : title"
    :aria-label="copied ? copiedTitle : title"
    @click.stop="onCopy"
  >
    <SvgIcon
      :size="iconSize"
      type="mdi"
      :path="copied ? mdiCheck : mdiContentCopy"
    />
  </MapControlButton>
</template>

<script setup lang="ts">
import {
  createCopyFeedback,
  type MapButtonSize,
  type MapButtonVariant,
} from '@hungpvq/map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCheck, mdiContentCopy } from '@mdi/js';
import { computed, onBeforeUnmount, ref } from 'vue';
import MapControlButton from './MapControlButton.vue';

/**
 * Shared copy action button: clipboard + mdiContentCopy → mdiCheck feedback
 * (~1.5s). Prefer this over ad-hoc MapControlButton + createCopyFeedback.
 */

defineOptions({
  name: 'MapCopyButton',
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    value?: string | number | null;
    title?: string;
    copiedTitle?: string;
    variant?: MapButtonVariant;
    size?: MapButtonSize | string;
    disabled?: boolean;
    /** SvgIcon size (px). Dense rows usually 14. */
    iconSize?: string | number;
  }>(),
  {
    value: '',
    title: 'Copy',
    copiedTitle: 'Copied',
    variant: 'plain',
    size: 'small',
    disabled: false,
    iconSize: 14,
  },
);

const copied = ref(false);
const copyFeedback = createCopyFeedback({
  onChange: (key) => {
    copied.value = key === 'copy';
  },
});

onBeforeUnmount(() => copyFeedback.dispose());

const text = computed(() =>
  props.value == null ? '' : String(props.value),
);

const isDisabled = computed(() => {
  if (props.disabled) return true;
  const t = text.value.trim();
  return !t || t === '—';
});

function onCopy() {
  void copyFeedback.copy('copy', text.value);
}
</script>
