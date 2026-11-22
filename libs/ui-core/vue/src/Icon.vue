<script lang="ts">
export default { name: 'Icon' };
</script>
<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>
<template>
  <i
    class="ui-icon map-icon mdi"
    :title="title"
  >
    <slot />
  </i>
</template>
