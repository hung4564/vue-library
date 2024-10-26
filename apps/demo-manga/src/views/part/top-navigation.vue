<template lang="">
  <div class="w-full max-w-screen-sm mx-auto px-2 mb-12">
    <div class="flex justify-between">
      <a
        class="text-sm mb-2 text-gray-400 hover:text-gray-200 py-1 flex items-center router-link-active"
      >
        <span
          aria-label="Arrow Left icon"
          role="img"
          class="material-design-icon arrow-left-icon inline-block mr-1"
        >
          <svg
            fill="currentColor"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            class="material-design-icon__svg"
          >
            <path
              d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"
            >
              <title>Arrow Left icon</title>
            </path>
          </svg>
        </span>
        {{ data.manga.name }}
      </a>
    </div>
    <h1 class="text-xl text-gray-100 mb-6">
      <span>Chương {{ data.number }}</span>
      <span v-if="data.name">: {{ data.number }}</span>
    </h1>
    <div class="flex items-stretch flex-col gap-2">
      <div>
        <button
          :disabled="!data.next_chapter_id"
          class="flex justify-center items-center button bg-gray-800 bg-opacity-20 text-gray-100 text-opacity-20 px-3 py-2 text-sm uppercase font-bold cursor-default w-full"
        >
          Chương sau
        </button>
      </div>
      <div>
        <a
          :disabled="!data.previous_chapter_id"
          class="flex justify-center items-center button bg-gray-800 hover:bg-gray-700 text-gray-100 px-3 py-2 text-sm uppercase font-bold"
        >
          Chương trước
        </a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { MangaChapter } from '../../types/manga';

defineProps<{ data: MangaChapter }>();
</script>
<style lang=""></style>
