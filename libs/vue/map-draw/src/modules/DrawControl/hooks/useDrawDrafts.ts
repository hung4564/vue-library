import { useShow } from '@hungpvq/vue-map-core';
import { Ref, ref } from 'vue';
import { isDraftOption, useConfigDrawControl } from '../../../store';
import { IDraftRecord, MapDrawOption } from '../../../types';

export function useDrawDrafts(
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
    if (!isDraftOption(drawOptions.value)) {
      return;
    }
    const action = drawOptions.value;
    draftItems.value = action.getDraftItems();
    draftCounts.value = draftItems.value.length;
  }

  const { commit, discard, save } = useConfigDrawControl(mapId, {
    onStart: callbacks.onStart,
    onEnd: callbacks.onEnd,
    onDiscard: () => {
      getCountDraftItem();
    },
    onCommit: () => {
      draftCounts.value = 0;
      draftItems.value = [];
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
