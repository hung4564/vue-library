<template>
  <MapControlButton
    :disabled="disabled"
    :title="title"
    @click.stop="onToggle"
    variant="plain"
    size="small"
  >
    <SvgIcon size="14" type="mdi" :path="path.show" v-if="show" />
    <SvgIcon size="14" type="mdi" :path="path.hide" v-else />
  </MapControlButton>
</template>
<script setup lang="ts">
import { MapControlButton } from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiEye, mdiEyeOff } from '@mdi/js';

const path = {
  show: mdiEye,
  hide: mdiEyeOff,
};

defineProps<{
  show: boolean;
  disabled?: boolean;
  title: string;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

function onToggle() {
  emit('toggle');
}
</script>
