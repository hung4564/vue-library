<template>
  <div
    v-if="isOpen"
    class="debug-overlay"
  >
    <div class="debug-overlay__panel">
      <DevtoolsShell
        show-close
        @close="host.setOpen(false)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { registerBuiltinDebugTabs } from './register-builtin';
import DevtoolsShell from './DevtoolsShell.vue';
import { useDebugHost } from './use-debug-host';

registerBuiltinDebugTabs();

const { host, isOpen } = useDebugHost();
</script>
