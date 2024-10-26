<script setup>
import AppHeader from '../part/AppHeader.vue';
</script>
<template>
  <div class="min-h-screen">
    <AppHeader />
    <main class="flex flex-col relative flex-grow w-full overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<style scoped></style>
