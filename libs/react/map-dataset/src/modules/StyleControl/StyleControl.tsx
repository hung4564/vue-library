import type { ComponentType, IDataset, IMapboxLayerView } from '@hungpvq/map-dataset';
import {
  findSiblingOrNearestLeaf,
  isMapboxLayerView,
  STYLE_CONTROL_LOCALE,
} from '@hungpvq/map-dataset';
import { copyByJson } from '@hungpvq/shared';
import { DraggableItemSideBar } from '@hungpvq/react-draggable';
import {
  ModuleContainer,
  RegistryItem,
  useLang,
  useMap,
  useShow,
} from '@hungpvq/react-map-core';
import { useEffect, useRef, useState } from 'react';

export function StyleControl({
  item,
  onClose,
}: {
  item: IDataset;
  onClose?: () => void;
}) {
  const { mapId, moduleContainerProps, callMap } = useMap();
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(false);
  const [layer, setLayer] = useState<unknown>();
  const [layerView, setLayerView] = useState<IMapboxLayerView | undefined>();
  const [component, setComponent] = useState<ComponentType>({
    componentKey: '',
  });
  const layerViewRef = useRef(layerView);
  layerViewRef.current = layerView;

  useEffect(() => {
    setLocaleDefault(STYLE_CONTROL_LOCALE);
    toggleShow(true);
    setLayerView(undefined);
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
      setComponent(layerViewFound.getComponentUpdate());
      setLayer(copyByJson(layerViewFound.getData()));
    }
  }

  function onUpdateStyle(value: unknown) {
    callMap((map) => {
      layerViewRef.current?.updateValue(map, value);
    });
    updateValue();
  }

  function handleClose() {
    setLayerView(undefined);
    setLayer(undefined);
    onClose?.();
  }

  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={(bind) =>
        component.componentKey ? (
          <DraggableItemSideBar
            {...bind}
            right
            show={show}
            onUpdateShow={(v) => {
              toggleShow(!!v);
              if (!v) handleClose();
            }}
            onClose={handleClose}
            title={trans('map.style-control.title')}
            titleNode={
              <span className="layer-control__title">
                {trans('map.style-control.title')}
              </span>
            }
          >
            <div className="style-control">
              <RegistryItem
                componentKey={component.componentKey}
                mapId={mapId}
                value={layer}
                trans={trans}
                onUpdateStyle={onUpdateStyle}
              />
            </div>
          </DraggableItemSideBar>
        ) : null
      }
    />
  );
}
