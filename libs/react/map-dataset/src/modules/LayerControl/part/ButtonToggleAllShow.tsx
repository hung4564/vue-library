import type { MapSimple } from '@hungpvq/map-core';

import type { GlobalVisibilityMode, IListViewUI } from '@hungpvq/map-dataset';
import {
  applyAllLayerVisibility,
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
  globalVisibilityMode = 'sync',
}: {
  mapId: string;
  items: IListViewUI[];
  globalVisibilityMode?: GlobalVisibilityMode;
}) {
  const { callMap } = useMap({ mapId });
  const { trans } = useLang(mapId);
  const { datasetVersion, getStoreDataset } = useMapDataset(mapId);
  void datasetVersion;
  const store = getStoreDataset();
  const allLayerShow = store?.allLayerShow !== false;

  useEffect(() => {
    if (globalVisibilityMode !== 'override') return;
    if (!store || store.allLayerShow) return;
    callMap((map: MapSimple) => {
      applyAllLayerVisibility(items, map, false, 'override');
    });
    // Re-hide when the list changes while global is off.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, mapId, datasetVersion, globalVisibilityMode]);

  function onToggleShow() {
    if (!store) return;
    const value = !store.allLayerShow;
    store.allLayerShow = value;
    notifyMapDatasetStore(store);
    callMap((map: MapSimple) => {
      applyAllLayerVisibility(items, map, value, globalVisibilityMode);
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
      size="medium"
      iconSize="16px"
      onToggle={onToggleShow}
    />
  );
}
