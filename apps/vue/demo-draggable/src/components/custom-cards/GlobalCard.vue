<script setup lang="ts">
defineProps<{
  height?: string | number;
  width?: string | number;
  highlight?: boolean;
}>();
</script>

<template>
  <div
    class="custom-card custom-card--global"
    :class="{ highlight }"
    :style="{ height, width }"
  >
    <div class="custom-card__badge">Global</div>
    <div class="custom-card__body">
      <slot />
    </div>
  </div>
</template>
