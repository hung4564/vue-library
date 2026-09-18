import {
  emptyDraftListSnapshot,
  getDraftListSnapshot,
  type IDraftRecord,
  type MapDrawOption,
} from '@hungpvq/map-draw';
import { useShow } from '@hungpvq/react-map-core';
import { useCallback, useState } from 'react';
import { useConfigDrawControl } from '../../../store';

export function useDrawDrafts(
  mapId: string,
  drawOptions: MapDrawOption | undefined,
  callbacks: {
    onStart: (config: MapDrawOption) => void;
    onEnd: () => void;
  },
) {
  const [draftCounts, setDraftCounts] = useState(0);
  const [showList, setShowList] = useShow(false);
  const [draftItems, setDraftItems] = useState<IDraftRecord[]>([]);

  const refreshDrafts = useCallback(() => {
    const snap = getDraftListSnapshot(drawOptions);
    if (!snap) return;
    setDraftItems(snap.items);
    setDraftCounts(snap.count);
  }, [drawOptions]);

  const { setFeature, save, commit, discard } = useConfigDrawControl(mapId, {
    onStart: callbacks.onStart,
    onEnd: callbacks.onEnd,
    onDiscard: refreshDrafts,
    onCommit: () => {
      const empty = emptyDraftListSnapshot();
      setDraftCounts(empty.count);
      setDraftItems(empty.items);
    },
  });

  const onCommit = useCallback(async () => {
    await commit();
    return drawOptions?.redraw?.(mapId);
  }, [commit, drawOptions, mapId]);

  const onDiscard = useCallback(
    (item?: IDraftRecord) => {
      void discard(item);
    },
    [discard],
  );

  const onShowListDraftItem = useCallback(() => {
    setShowList(true);
  }, [setShowList]);

  return {
    draftItems,
    draftCounts,
    showList,
    setShowList,
    refreshDrafts,
    onCommit,
    onDiscard,
    onShowListDraftItem,
    setFeature,
    save,
  };
}
