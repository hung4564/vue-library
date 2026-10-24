<template>
  <DevtoolsShell
    :show-close="showClose"
    @close="emit('close')"
  />
</template>

<script setup lang="ts">
import { DevtoolsShell } from '@hungpvq/vue-shared-log';

withDefaults(
  defineProps<{
    showClose?: boolean;
  }>(),
  { showClose: false },
);

const emit = defineEmits<{ close: [] }>();
</script>
