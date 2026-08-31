<template>
  <div class="row-container">
    <div class="btn-copy">
      <base-button @click="copy(value)">
        <SvgIcon :path="path.copy" size="14" type="mdi" />
      </base-button>
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
