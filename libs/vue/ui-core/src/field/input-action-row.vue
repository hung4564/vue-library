<script setup lang="ts">
/**
 * Joined field + action button row (CreateControl Url|Load pattern).
 * Default slot: `.form-group` field. `#action`: MapControlButton (or any button).
 */
withDefaults(
  defineProps<{
    /** Drop top margin (e.g. toolbar / find rows). */
    flush?: boolean;
  }>(),
  { flush: false },
);
</script>

<template>
  <div
    class="input-action-row"
    :class="{ 'input-action-row--flush': flush }"
  >
    <slot />
    <div class="input-action-row__action">
      <slot name="action" />
    </div>
  </div>
</template>
