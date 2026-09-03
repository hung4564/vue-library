import type { WithMapPropType } from '@hungpvq/map-core';
import { LAYER_INFO_CONTROL_LOCALE } from '@hungpvq/map-dataset';
import { DraggableItemFloat } from '@hungpvq/react-draggable';
import {
  MapCommonButton,
  ModuleContainer,
  defaultMapProps,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
  useToolbarControl,
} from '@hungpvq/react-map-core';
import { mdiLayers } from '@mdi/js';
import { useEffect } from 'react';
import { LayerList } from './LayerControl/LayerList';

export function LayerInfoControl(props: WithMapPropType & { show?: boolean }) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps, order } = useMap({ ...merged, controlId: 'mapLayerInfoControl' });
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(props.show);
  const { panelBind } = useRegisterMapControl(mapId, {
    id: 'mapLayerInfoControl',
    panelKind: 'float',
    title: trans('map.layer-info-control.title'),
    buttonPosition: merged.position,
    show,
    setShow: toggleShow,
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
    }),
    actions: [{ type: 'mapLayerInfoControl', run: () => toggleShow() }],
  });

  useEffect(() => {
    setLocaleDefault(LAYER_INFO_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: 'mapLayerInfoControl',
    getState: () => ({
      visible: !show,
      active: show,
      title: trans('map.layer-info-control.title'),
      order,
      icon: { type: 'mdi' as const, path: mdiLayers },
    }),
    onClick: () => toggleShow(),
  });

  useEffect(() => {
    control.sync();
  }, [show, control]);

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        state ? (
          <MapCommonButton
            option={state}
            onClick={(e) => {
              e.stopPropagation();
              control.onAction(e.nativeEvent);
            }}
          />
        ) : null
      }
      draggable={(bind) =>
        show ? (
          <DraggableItemFloat
            show={show}
            onUpdateShow={(v) => toggleShow(!!v)}
            title={trans('map.layer-info-control.title')}
            containerId={bind.containerId}
            top={panelBind.top ?? bind.top}
            bottom={panelBind.bottom ?? bind.bottom}
            left={panelBind.left ?? bind.left}
            right={panelBind.right}
          >
            <LayerList mapId={mapId} readonly />
          </DraggableItemFloat>
        ) : null
      }
    />
  );
}
