<script lang="ts">
export default { name: 'export-geo-loading' };
</script>
<template>
  <p class="export-geo__loading" role="status" aria-live="polite">
    Preparing download…
  </p>
</template>
<style scoped>
.export-geo__loading {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.85;
}
</style>
