<template lang="">
  <div class="mt-12 w-full flex justify-center">
    <button
      :disabled="!data.next_chapter_id"
      class="button w-full max-w-screen-sm py-3 px-3 text-center"
    >
      Đây là chương mới nhất
    </button>
  </div>
  <div class="mt-2 w-full flex justify-center">
    <div class="max-w-screen-sm w-full flex">
      <a
        class="uppercase button bg-gray-800 text-gray-300 w-full px-1 py-1 mr-1 text-center"
      >
        Chương trước
      </a>
      <button
        class="uppercase button bg-gray-800 text-gray-300 w-full px-1 py-1 ml-1 text-center"
      >
        Lên đầu
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { MangaChapter } from '../../types/manga';

defineProps<{ data: MangaChapter }>();
</script>

<style lang="scss">
.button-disabled,
.button:disabled {
  cursor: default;
  --tw-bg-opacity: 1;
  background-color: rgb(107 114 128 / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: rgb(75 85 99 / var(--tw-text-opacity));
  pointer-events: none;
}
.button {
  white-space: nowrap;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter;
  transition-duration: 0.2s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
