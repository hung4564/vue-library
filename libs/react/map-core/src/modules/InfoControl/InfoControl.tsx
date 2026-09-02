import {
  copyText,
  downloadDataUrl,
  INFO_CONTROL_LOCALE,
  exportMapbox,
  readMapViewInfo,
  type MapSimple,
  type MapViewInfo,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  mdiCameraOutline,
  mdiContentCopy,
  mdiInformationOutline,
} from '@mdi/js';
import Icon from '@mdi/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MapCommonButton } from '../../components/MapCommonButton';
import { useLang } from '../../extra';
import { useToolbarControl } from '../../extra/toolbar';
import { BaseButton } from '../../field';
import { defaultMapProps, useMap } from '../../hooks';
import {
  ModuleContainer,
  type BindPosition,
} from '../ModuleContainer/ModuleContainer';

export interface InfoControlProps extends WithMapPropType {
  show?: boolean;
  fileName?: string;
}

const EMPTY_INFO: MapViewInfo = {
  center: '',
  zoom: '',
  pitch: '',
  bearing: '',
  projection: '',
  bounds: '',
};

export function InfoControl(props: InfoControlProps) {
  const mergedProps = { ...defaultMapProps, fileName: 'map', ...props };
  const { callMap, mapId, moduleContainerProps, order } = useMap(mergedProps);
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, setShow] = useState(props.show ?? false);
  const [info, setInfo] = useState<MapViewInfo>(EMPTY_INFO);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    setLocaleDefault(INFO_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  const syncInfo = useCallback(() => {
    callMap((map) => {
      setInfo(readMapViewInfo(map));
    });
  }, [callMap]);

  const attachListeners = useCallback(
    (map: MapSimple) => {
      map.on('move', syncInfo);
      map.on('pitch', syncInfo);
      map.on('rotate', syncInfo);
      map.on('styledata', syncInfo);
    },
    [syncInfo],
  );

  const detachListeners = useCallback(
    (map: MapSimple) => {
      map.off('move', syncInfo);
      map.off('pitch', syncInfo);
      map.off('rotate', syncInfo);
      map.off('styledata', syncInfo);
    },
    [syncInfo],
  );

  const callMapRef = useRef(callMap);
  callMapRef.current = callMap;
  const syncInfoRef = useRef(syncInfo);
  syncInfoRef.current = syncInfo;
  const attachListenersRef = useRef(attachListeners);
  attachListenersRef.current = attachListeners;
  const detachListenersRef = useRef(detachListeners);
  detachListenersRef.current = detachListeners;

  useEffect(() => {
    if (!show) {
      callMapRef.current(detachListenersRef.current);
      return;
    }
    syncInfoRef.current();
    callMapRef.current(attachListenersRef.current);
    return () => {
      callMapRef.current(detachListenersRef.current);
    };
  }, [show]);

  const handleToggle = useCallback(() => {
    setShow((visible) => !visible);
  }, []);

  const onScreenshot = useCallback(() => {
    callMap(async (map) => {
      setCapturing(true);
      try {
        const image = await exportMapbox(map);
        downloadDataUrl(image, `${mergedProps.fileName}.png`);
      } finally {
        setCapturing(false);
      }
    });
  }, [callMap, mergedProps.fileName]);

  const { state, control } = useToolbarControl(mapId, mergedProps, {
    kind: 'single',
    id: 'mapInfoControl',
    getState: () => ({
      visible: true,
      active: show,
      title: trans('map.info-control.title'),
      order,
      icon: { type: 'mdi' as const, path: mdiInformationOutline },
    }),
    onClick: () => handleToggle(),
  });
  const controlRef = useRef(control);
  controlRef.current = control;

  useEffect(() => {
    controlRef.current.sync();
  }, [show]);

  const draggableContent = useCallback(
    (bind: BindPosition) => {
      const rows = [
        { key: 'center', label: trans('map.info-control.center'), value: info.center },
        { key: 'zoom', label: trans('map.info-control.zoom'), value: info.zoom },
        { key: 'pitch', label: trans('map.info-control.pitch'), value: info.pitch },
        { key: 'bearing', label: trans('map.info-control.bearing'), value: info.bearing },
        {
          key: 'projection',
          label: trans('map.info-control.projection'),
          value: info.projection,
        },
        { key: 'bounds', label: trans('map.info-control.bounds'), value: info.bounds },
      ];

      return (
        <DraggableItemPopup
          show={show}
          onUpdateShow={setShow}
          title={trans('map.info-control.title')}
          width={360}
          height={340}
          extraBtn={
            <BaseButton
              title={trans('map.info-control.screenshot')}
              disabled={capturing}
              onClick={(e) => {
                e.stopPropagation();
                onScreenshot();
              }}
            >
              <Icon path={mdiCameraOutline} size={16 / 24} />
            </BaseButton>
          }
          {...bind}
        >
          <div className="map-info-control">
            <div className="map-info-control__rows">
              {rows.map((row) => (
                <div key={row.key} className="map-info-control__row">
                  <div className="map-info-control__label">{row.label}</div>
                  <div className="map-info-control__value">{row.value}</div>
                  <BaseButton
                    className="map-info-control__copy"
                    title={trans('map.info-control.copy')}
                    onClick={(e) => {
                      e.stopPropagation();
                      void copyText(row.value);
                    }}
                  >
                    <Icon path={mdiContentCopy} size={14 / 24} />
                  </BaseButton>
                </div>
              ))}
            </div>
          </div>
        </DraggableItemPopup>
      );
    },
    [show, capturing, onScreenshot, info, trans],
  );

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
      draggable={draggableContent}
    />
  );
}
