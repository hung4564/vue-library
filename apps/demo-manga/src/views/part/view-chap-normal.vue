<template lang="">
  <div class="select-none flex flex-col items-center">
    <viewImage
      v-for="(item, i) in data.pages"
      :key="i"
      :src="item"
      @inView="setPageCurrenIndex(i)"
    >
    </viewImage>
  </div>
</template>
<script setup lang="ts">
import { MangaChapter } from '../../types/manga';
import { setPageIndex } from '../store';
import viewImage from './view-image.vue';
defineProps<{ data: MangaChapter }>();
function setPageCurrenIndex(page: number) {
  setPageIndex(page);
}
</script>
<style lang=""></style>
