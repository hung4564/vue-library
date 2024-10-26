<template lang="">
  <div class="transition transform max-w-full mb-6 last:mb-0">
    <img :src="src" />
  </div>
  <div ref="target"></div>
</template>
<script setup lang="ts">
import { useIntersectionObserver } from '@hungpvq/shared-core';
import { ref } from 'vue';
defineProps<{ src: string }>();
const emits = defineEmits(['inView']);
const target = ref(null);
const isVisible = ref(false);

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  isVisible.value = isIntersecting;
  if (isIntersecting) emits('inView');
});
</script>
<style lang=""></style>
