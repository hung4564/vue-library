<script setup lang="ts">
import { useLiveHookDebug } from '@hungpvq/vue-shared-log';

useLiveHookDebug('SharedLogDemoTab');
</script>

<template>
  <div style="padding: 12px; font-size: 13px">
    Custom tab registered via <code>globalThis.__hungpvqDebug</code> (no
    <code>registerDebugTab</code> import). Live tab tracks this panel via
    <code>useLiveHookDebug</code>.
  </div>
</template>
