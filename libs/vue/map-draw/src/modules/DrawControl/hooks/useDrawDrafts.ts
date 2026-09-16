import type { IDraftRecord, MapDrawOption } from '@hungpvq/map-draw';
import {
  emptyDraftListSnapshot,
  getDraftListSnapshot,
} from '@hungpvq/map-draw';
import { useShow } from '@hungpvq/vue-map-core';
import { type Ref, ref } from 'vue';
import { useConfigDrawControl } from '../../../store';

function useDrawDrafts(
  mapId: string,
  drawOptions: Ref<MapDrawOption | undefined>,
  callbacks: {
    onStart: (config: MapDrawOption) => void;
    onEnd: () => void;
  },
) {
  const draftItems = ref<IDraftRecord[]>([]);
  const draftCounts = ref(0);
  const [showListDraftItem, setShowListDraftItem] = useShow();

  function getCountDraftItem() {
    const snap = getDraftListSnapshot(drawOptions.value);
    if (!snap) {
      return;
    }
    draftItems.value = snap.items;
    draftCounts.value = snap.count;
  }

  const { commit, discard, save } = useConfigDrawControl(mapId, {
    onStart: callbacks.onStart,
    onEnd: callbacks.onEnd,
    onDiscard: () => {
      getCountDraftItem();
    },
    onCommit: () => {
      const empty = emptyDraftListSnapshot();
      draftCounts.value = empty.count;
      draftItems.value = empty.items;
    },
  });

  async function onCommit() {
    const action = drawOptions.value;
    await commit();
    return action?.redraw && action.redraw(mapId);
  }

  function onDiscard() {
    discard();
  }

  function onDiscardItem(item: IDraftRecord) {
    discard(item);
  }

  function onShowListDraftItem() {
    setShowListDraftItem(true);
  }

  return {
    draftItems,
    draftCounts,
    showListDraftItem,
    setShowListDraftItem,
    getCountDraftItem,
    onCommit,
    onDiscard,
    onDiscardItem,
    onShowListDraftItem,
    save,
  };
}

export { useDrawDrafts };
