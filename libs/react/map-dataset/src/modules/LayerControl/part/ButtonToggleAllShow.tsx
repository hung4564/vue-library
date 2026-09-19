import type { MapSimple } from '@hungpvq/map-core';

import type { IListViewUI } from '@hungpvq/map-dataset';
import {
  applyGlobalLayerVisibility,
  notifyMapDatasetStore,
} from '@hungpvq/map-dataset';
import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
import { RegistryItem, useLang, useMap } from '@hungpvq/react-map-core';
import { useEffect } from 'react';
import { ToggleShowButton } from '../../../extra/component/toggle-show-button';
import { useMapDataset } from '../../../store/dataset-api';

export function ButtonToggleAllShow({
  mapId,
  items,
}: {
  mapId: string;
  items: IListViewUI[];
}) {
  const { callMap } = useMap({ mapId });
  const { trans } = useLang(mapId);
  const { datasetVersion, getStoreDataset } = useMapDataset(mapId);
  void datasetVersion;
  const store = getStoreDataset();
  const allLayerShow = store?.allLayerShow !== false;

  useEffect(() => {
    if (!store || store.allLayerShow) return;
    callMap((map: MapSimple) => {
      applyGlobalLayerVisibility(items, map, false);
    });
    // Re-hide when the list changes while global is off.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, mapId, datasetVersion]);

  function onToggleShow() {
    if (!store) return;
    const value = !store.allLayerShow;
    store.allLayerShow = value;
    notifyMapDatasetStore(store);
    callMap((map: MapSimple) => {
      applyGlobalLayerVisibility(items, map, value);
    });
  }

  return (
    <RegistryItem
      componentKey={LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton}
      defaultComponent={ToggleShowButton}
      mapId={mapId}
      show={allLayerShow}
      title={trans(
        allLayerShow
          ? 'map.layer-control.toggle.hide-all'
          : 'map.layer-control.toggle.show-all',
      )}
      onToggle={onToggleShow}
    />
  );
}
