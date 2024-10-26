<template lang="">
  <div
    class="fixed z-50 flex items-center h-10 bg-gray-300 justify-between tooltip overflow-hidden shadow-lg"
  >
    <div
      class="flex items-center px-2 w-full justify-center max-w-[48rem] w-full"
    >
      <a
        :disabled="!data.previous_chapter_id"
        class="text-gray-700 hover:text-gray-300 rounded h-7 w-7 bg-gray-400 hover:bg-gray-800 flex items-center justify-center mx-1 flex-none"
      >
        <span
          aria-label="Chevron Left icon"
          role="img"
          class="material-design-icon chevron-left-icon"
          ><svg
            fill="currentColor"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            class="material-design-icon__svg"
          >
            <path
              d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
            >
              <title>Chevron Left icon</title>
            </path>
          </svg></span
        ></a
      >
      <button
        disabled="disabled"
        class="button-bare h-7 px-1 bg-gray-400 text-sm w-full fine-transition border-gray-400 uppercase relative truncate rounded mx-1 cursor-default"
      >
        <div class="absolute top-0 left-0 w-full h-full">
          <div class="bg-gray-500 h-full" :style="{ width: progress }"></div>
        </div>
        <div class="relative">Chương {{ data.number }}</div>
      </button>
      <button
        :disabled="!data.next_chapter_id"
        class="text-blue-200 text-xs uppercase font-bold text-opacity-70 rounded h-7 px-2 bg-blue-700 bg-opacity-40 flex items-center justify-center cursor-default mx-1 flex-none"
      >
        <span class="hidden lg:block">Tiếp </span>
        <span
          aria-label="Chevron Right icon"
          role="img"
          class="material-design-icon chevron-right-icon"
          ><svg
            fill="currentColor"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            class="material-design-icon__svg"
          >
            <path
              d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
            >
              <title>Chevron Right icon</title>
            </path>
          </svg></span
        >
      </button>
    </div>
    <button
      class="button-bare h-full px-6 bg-gray-400 hover:bg-gray-700 hover:text-gray-300 text-sm md:text-base fine-transition flex justify-center items-center w-16"
    >
      <span
        aria-label="Arrow Up icon"
        role="img"
        class="material-design-icon arrow-up-icon"
        ><svg
          fill="currentColor"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          class="material-design-icon__svg"
        >
          <path
            d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"
          >
            <title>Arrow Up icon</title>
          </path>
        </svg></span
      >
    </button>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { MangaChapter } from '../../types/manga';
import { getPageIndex } from '../store';

const props = defineProps<{ data: MangaChapter }>();
const progress = computed(() => {
  if (props.data.pages.length < 2) {
    return '100%';
  }
  return `${(
    (getPageIndex().value / (props.data.pages.length - 1)) *
    100
  ).toFixed(4)}%`;
});
</script>

<style scoped>
@media (min-width: 768px) {
  .tooltip {
    width: auto;
    min-width: 28rem;
    bottom: 1.25rem;
    left: 2.5rem;
    border-radius: 0.25rem;
  }
}
</style>
