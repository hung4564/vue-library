<template>
  <BaseButton :disabled="disabled" :title="title" @click.stop="onToggle">
    <SvgIcon size="14" type="mdi" :path="path.show" v-if="show" />
    <SvgIcon size="14" type="mdi" :path="path.hide" v-else />
  </BaseButton>
</template>
<script setup lang="ts">
import { BaseButton } from '@hungpvq/vue-map-core';
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
