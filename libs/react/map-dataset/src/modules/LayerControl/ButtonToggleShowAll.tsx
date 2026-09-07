import type { MapSimple } from '@hungpvq/map-core';
import type { IListViewUI } from '@hungpvq/map-dataset';
import {
  applyGlobalLayerVisibility,
  LAYER_CONTROL_LOCALE,
  LIST_VIEW_MENU_COMPONENT_KEY,
} from '@hungpvq/map-dataset';
import { RegistryItem, useLang, useMap } from '@hungpvq/react-map-core';
import { useEffect } from 'react';
import { ToggleShowButton } from '../../extra/component/toggle-show-button';
import {
  notifyMapDatasetStore,
  useMapDataset,
  useMapDatasetStore,
} from '../../store';

export function ButtonToggleShowAll({
  mapId,
  items,
}: {
  mapId: string;
  items: IListViewUI[];
}) {
  const { callMap } = useMap({ mapId });
  const { trans, setLocaleDefault } = useLang(mapId);
  useMapDataset(mapId);
  const store = useMapDatasetStore(mapId);
  const allLayerShow = store.allLayerShow;

  useEffect(() => {
    setLocaleDefault(LAYER_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  useEffect(() => {
    if (!store.allLayerShow) {
      callMap((map: MapSimple) => {
        applyGlobalLayerVisibility(items, map, false);
      });
    }
    // Re-hide when the list changes while global is off.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, mapId]);

  function onToggleShow() {
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
