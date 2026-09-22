<template>
  <MapControlButton
    :disabled="disabled"
    :title="title"
    :size="size"
    @click.stop="onToggle"
    variant="plain"
  >
    <SvgIcon :size="iconSize" type="mdi" :path="path.show" v-if="show" />
    <SvgIcon :size="iconSize" type="mdi" :path="path.hide" v-else />
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

withDefaults(
  defineProps<{
    show: boolean;
    disabled?: boolean;
    title: string;
    /** Match LayerControl header siblings (`medium` + 16); rows keep `small` + 14. */
    size?: 'small' | 'medium' | 'large' | number;
    iconSize?: string | number;
  }>(),
  {
    size: 'small',
    iconSize: 14,
  },
);

const emit = defineEmits<{
  toggle: [];
}>();

function onToggle() {
  emit('toggle');
}
</script>
