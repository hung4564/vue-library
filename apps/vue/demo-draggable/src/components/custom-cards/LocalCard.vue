<script setup lang="ts">
defineProps<{
  height?: string | number;
  width?: string | number;
  highlight?: boolean;
}>();
</script>

<template>
  <div
    class="custom-card custom-card--local"
    :class="{ highlight }"
    :style="{ height, width }"
  >
    <div class="custom-card__badge">Local</div>
    <div class="custom-card__body">
      <slot />
    </div>
  </div>
</template>
