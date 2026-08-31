import type { IDataset, IMapboxLayerView } from '@hungpvq/map-dataset';
import {
  findSiblingOrNearestLeaf,
  isMapboxLayerView,
} from '@hungpvq/map-dataset';
import { copyByJson } from '@hungpvq/shared';
import { DraggableItemSideBar } from '@hungpvq/react-draggable';
import {
  InputText,
  ModuleContainer,
  RegistryItem,
  useLang,
  useMap,
  useShow,
} from '@hungpvq/react-map-core';
import { useEffect, useState } from 'react';

export function StyleControl({
  item,
  onClose,
}: {
  item: IDataset;
  onClose?: () => void;
}) {
  const { mapId, moduleContainerProps, callMap } = useMap();
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(true);
  const [layer, setLayer] = useState<unknown>();
  const [layerView, setLayerView] = useState<IMapboxLayerView | undefined>();
  const [componentKey, setComponentKey] = useState('');

  useEffect(() => {
    setLocaleDefault({ map: { 'style-control': { title: 'Style Control' } } });
    updateValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, setLocaleDefault]);

  function updateValue() {
    const layerViewFound = findSiblingOrNearestLeaf<IMapboxLayerView & IDataset>(
      item,
      (dataset) => isMapboxLayerView(dataset),
    );
    if (layerViewFound && isMapboxLayerView(layerViewFound)) {
      setLayerView(layerViewFound);
      const component = layerViewFound.getComponentUpdate();
      setComponentKey(component.componentKey);
      setLayer(copyByJson(layerViewFound.getData()));
    }
  }

  function onUpdateStyle(value: unknown) {
    callMap((map) => {
      if (layerView) layerView.updateValue(map, value);
    });
    updateValue();
  }

  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={(bind) => (
          <DraggableItemSideBar
            show={show && !!componentKey}
            onUpdateShow={(v) => {
              toggleShow(!!v);
              if (!v) onClose?.();
            }}
            title={trans('map.style-control.title')}
            containerId={bind.containerId}
          >
            <div className="style-control">
              <RegistryItem
                componentKey={componentKey}
                mapId={mapId}
                value={layer}
                trans={trans}
                onUpdateStyle={onUpdateStyle}
              />
              <InputText
                label="Raw layer JSON"
                value={JSON.stringify(layer, null, 2)}
                onChange={(v) => {
                  try {
                    onUpdateStyle(JSON.parse(v));
                  } catch {
                    /* ignore invalid json while typing */
                  }
                }}
              />
            </div>
          </DraggableItemSideBar>
      )}
    />
  );
}
