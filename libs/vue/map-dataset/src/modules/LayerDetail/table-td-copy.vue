<template>
  <div class="layer-detail-row">
    <div class="layer-detail-row__copy">
      <MapControlButton @click="onCopy" aria-label="Copy" variant="plain">
        <SvgIcon :path="path.copy" size="14" type="mdi" />
      </MapControlButton>
    </div>
    <slot />
  </div>
</template>
<script setup>
import { copyText } from '@hungpvq/map-core';
import { MapControlButton } from '@hungpvq/vue-map-core';

import SvgIcon from '@jamescoyle/vue-icon';
import { mdiContentCopy } from '@mdi/js';

const props = defineProps({
  value: {},
});
const path = {
  copy: mdiContentCopy,
};

function onCopy() {
  void copyText(props.value == null ? '' : String(props.value));
}
</script>
