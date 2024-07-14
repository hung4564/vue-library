<template>
  <tr>
    <slot />
    <td style="min-width: 55px">
      <div class="btn-copy">
        <base-button @click="copy(value)">
          <SvgIcon :path="path.copy" size="14" type="mdi" />
        </base-button>
      </div>
    </td>
  </tr>
</template>
<script setup>
import { BaseButton } from '@hungpvq/vue-map-core';
import { useClipboard } from '@hungpvq/shared-core';
import SvgIcon from '@jamescoyle/vue-icon';
const { copy } = useClipboard({});
import { mdiContentCopy } from '@mdi/js';
defineProps({
  value: {},
});
const path = {
  copy: mdiContentCopy,
};
</script>
<style scoped>
tr {
  padding: 0 16px;
}
tr .btn-copy {
  display: none;
}
tr:hover .btn-copy {
  display: block;
}
</style>
