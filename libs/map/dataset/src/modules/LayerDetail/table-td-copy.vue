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
<style scoped>
.row-container {
  padding: 8px 16px;
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  min-height: 40px;
}

.btn-copy {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  display: none;
}

.row-container:hover .btn-copy {
  display: block;
}
</style>
