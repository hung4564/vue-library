<template>
  <div class="layer-detail-row">
    <div class="layer-detail-row__copy">
      <MapControlButton @click="copy(value)" aria-label="Copy" variant="plain">
        <SvgIcon :path="path.copy" size="14" type="mdi" />
      </MapControlButton>
    </div>
    <slot />
  </div>
</template>
<script setup>
import { useClipboard } from '@hungpvq/shared-core';
import { MapControlButton } from '@hungpvq/vue-map-core';

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
