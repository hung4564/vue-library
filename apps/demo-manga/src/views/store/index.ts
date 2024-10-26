import { createStore } from '@hungpvq/shared';
import { Ref, ref } from 'vue';
import { MangaChapter } from '../../types/manga';

const store = createStore<{ pageIndex: Ref<number>; manga?: MangaChapter }>(
  'manga.detail',
  {
    pageIndex: ref(0),
  }
);
export function setPageIndex(index: number) {
  store.pageIndex.value = index;
}

export function setManga(manga: MangaChapter) {
  store.manga = manga;
}
export function getPageIndex() {
  return store.pageIndex;
}
