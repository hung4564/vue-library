<template>
  <div class="layer-detail-row">
    <div class="layer-detail-row__copy">
      <BaseButton @click="copy(value)" aria-label="Copy">
        <SvgIcon :path="path.copy" size="14" type="mdi" />
      </BaseButton>
    </div>
    <slot />
  </div>
</template>
<script setup>
import { useClipboard } from '@hungpvq/shared-core';
import { BaseButton } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiContentCopy } from '@mdi/js';
const { copy } = useClipboard({});
defineProps({
  value: {},
});
const path = {
  copy: mdiContentCopy,
};
</script>
