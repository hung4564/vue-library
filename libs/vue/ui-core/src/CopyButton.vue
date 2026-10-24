<script lang="ts">
export default { name: 'CopyButton' };
</script>
<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCheck, mdiContentCopy } from '@mdi/js';
import { computed, onBeforeUnmount, ref } from 'vue';

import BaseButton from './BaseButton.vue';
import type { UiButtonSize, UiButtonVariant } from './ui-button';

const props = withDefaults(
  defineProps<{
    value?: string | number | null;
    title?: string;
    copiedTitle?: string;
    disabled?: boolean;
    /** icon | plain | text | tonal | outlined | filled. Default `plain`. */
    variant?: UiButtonVariant;
    /** small | medium | large | number (px). Default `small`. */
    size?: UiButtonSize | string;
    /** SvgIcon size (px). Dense rows usually 14. */
    iconSize?: string | number;
    /** Also render title / copiedTitle next to the icon. */
    labeled?: boolean;
  }>(),
  {
    value: '',
    title: 'Copy',
    copiedTitle: 'Copied',
    disabled: false,
    variant: 'plain',
    size: 'small',
    iconSize: 14,
    labeled: false,
  },
);

const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

const text = computed(() => (props.value == null ? '' : String(props.value)));
const isDisabled = computed(() => {
  if (props.disabled) return true;
  const t = text.value.trim();
  return !t || t === '—';
});
const label = computed(() => (copied.value ? props.copiedTitle : props.title));

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});

async function onCopy() {
  try {
    await navigator.clipboard.writeText(text.value);
    copied.value = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    /* ignore */
  }
}
</script>
<template>
  <BaseButton
    :variant="variant"
    :size="size"
    :title="label"
    :disabled="isDisabled"
    :aria-label="label"
    @click.stop="onCopy"
  >
    <SvgIcon
      :size="iconSize"
      type="mdi"
      :path="copied ? mdiCheck : mdiContentCopy"
    />
    <span v-if="labeled">{{ label }}</span>
  </BaseButton>
</template>
