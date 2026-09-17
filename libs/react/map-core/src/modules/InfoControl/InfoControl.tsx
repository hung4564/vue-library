import {
  attachMapViewInfoListeners,
  copyImageDataUrl,
  downloadDataUrl,
  EMPTY_MAP_VIEW_INFO,
  INFO_CONTROL_LOCALE,
  latDMS,
  lngDMS,
  parseCoordinateText,
  readMapViewInfo,
  type MapViewInfo,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { exportMapbox } from '@hungpvq/map-core/print';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  mdiCameraOutline,
  mdiContentCopy,
  mdiInformationOutline,
} from '@mdi/js';
import Icon from '@mdi/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MapCommonButton } from '../../components/MapCommonButton';
import { MapControlButton } from '../../components/MapControlButton';
import { MapCopyButton } from '../../components/MapCopyButton';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import {
  ModuleContainer,
  type BindPosition,
} from '../ModuleContainer/ModuleContainer';

export interface InfoControlProps extends WithMapPropType {
  show?: boolean;
  fileName?: string;
}

export function InfoControl(props: InfoControlProps) {
  const mergedProps = { ...defaultMapProps, fileName: 'map', ...props };
  const { callMap, mapId, moduleContainerProps, order } = useMap({
    ...mergedProps,
    controlId: 'mapInfoControl',
  });
  const { trans, registerLocale } = useLang(mapId);
  const [show, setShow] = useState(props.show ?? false);
  const [info, setInfo] = useState<MapViewInfo>(EMPTY_MAP_VIEW_INFO);
  const [centerDms, setCenterDms] = useState('');
  const [showDms, setShowDms] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const detachInfoRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    registerLocale('en', INFO_CONTROL_LOCALE);
  }, [registerLocale]);

  const syncInfo = useCallback(() => {
    callMap((map) => {
      setInfo(readMapViewInfo(map));
      const c = map.getCenter();
      setCenterDms(`${latDMS(c.lat)}, ${lngDMS(c.lng)}`);
    });
  }, [callMap]);

  const callMapRef = useRef(callMap);
  callMapRef.current = callMap;
  const syncInfoRef = useRef(syncInfo);
  syncInfoRef.current = syncInfo;

  useEffect(() => {
    if (!show) {
      detachInfoRef.current?.();
      detachInfoRef.current = null;
      return;
    }
    syncInfoRef.current();
    callMapRef.current((map) => {
      detachInfoRef.current?.();
      detachInfoRef.current = attachMapViewInfoListeners(map, () => {
        syncInfoRef.current();
      });
    });
    return () => {
      detachInfoRef.current?.();
      detachInfoRef.current = null;
    };
  }, [show]);

  const handleToggle = useCallback(() => {
    setShow((visible) => !visible);
  }, []);

  const { panelBind } = useRegisterMapControl(mapId, {
    id: 'mapInfoControl',
    panelKind: 'popup',
    title: trans('map.info-control.title'),
    buttonPosition: mergedProps.position,
    show,
    setShow,
    getProps: () => ({
      position: mergedProps.position,
      controlLayout: mergedProps.controlLayout,
      fileName: mergedProps.fileName,
    }),
    actions: [{ type: 'mapInfoControl', run: () => handleToggle() }],
  });

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

  const onCopyImage = useCallback(() => {
    callMap(async (map) => {
      setCapturing(true);
      try {
        const image = await exportMapbox(map);
        await copyImageDataUrl(image);
      } finally {
        setCapturing(false);
      }
    });
  }, [callMap]);

  const onPasteGoTo = useCallback(async () => {
    try {
      const text = await navigator.clipboard?.readText?.();
      const parsed = parseCoordinateText(text || '');
      if (!parsed) return;
      callMap((map) => {
        map.setCenter([parsed.lng, parsed.lat]);
        if (parsed.zoom != null) map.setZoom(parsed.zoom);
      });
    } catch {
      // Clipboard permission denied — ignore.
    }
  }, [callMap]);

  const { state, control } = useToolbarControl(mapId, mergedProps, {
    kind: 'single',
    id: 'mapInfoControl',
    getState: () =>
      mdiButtonState(mdiInformationOutline, {
        visible: true,
        active: show,
        title: trans('map.info-control.title'),
        order,
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
        {
          key: 'center',
          label: trans('map.info-control.center'),
          value: showDms ? centerDms || info.center : info.center,
        },
        {
          key: 'zoom',
          label: trans('map.info-control.zoom'),
          value: info.zoom,
        },
        {
          key: 'pitch',
          label: trans('map.info-control.pitch'),
          value: info.pitch,
        },
        {
          key: 'bearing',
          label: trans('map.info-control.bearing'),
          value: info.bearing,
        },
        {
          key: 'projection',
          label: trans('map.info-control.projection'),
          value: info.projection,
        },
        {
          key: 'bounds',
          label: trans('map.info-control.bounds'),
          value: info.bounds,
        },
      ];

      return (
        <DraggableItemPopup
          show={show}
          onUpdateShow={setShow}
          title={trans('map.info-control.title')}
          width={360}
          height={380}
          extraBtn={
            <>
              <MapControlButton
                variant="plain"
                title={trans('map.info-control.screenshot')}
                disabled={capturing}
                onClick={(e) => {
                  e.stopPropagation();
                  onScreenshot();
                }}
              >
                <Icon path={mdiCameraOutline} size="16px" />
              </MapControlButton>
              <MapControlButton
                variant="plain"
                title={trans('map.info-control.copy-image')}
                disabled={capturing}
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyImage();
                }}
              >
                <Icon path={mdiContentCopy} size="16px" />
              </MapControlButton>
            </>
          }
          {...bind}
          {...panelBind}
        >
          <div className="map-info-control">
            <div className="map-info-control__actions">
              <MapControlButton
                variant="outlined"
                title={
                  showDms
                    ? trans('map.info-control.decimal')
                    : trans('map.info-control.dms')
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDms((v) => !v);
                }}
              >
                {showDms
                  ? trans('map.info-control.decimal')
                  : trans('map.info-control.dms')}
              </MapControlButton>
              <MapControlButton
                variant="outlined"
                title={trans('map.info-control.paste')}
                onClick={(e) => {
                  e.stopPropagation();
                  void onPasteGoTo();
                }}
              >
                {trans('map.info-control.paste')}
              </MapControlButton>
            </div>
            <div className="map-info-control__rows">
              {rows.map((row) => (
                <div key={row.key} className="map-info-control__row">
                  <div className="map-info-control__label">{row.label}</div>
                  <div className="map-info-control__value">{row.value}</div>
                  <MapCopyButton
                    className="map-info-control__copy"
                    value={row.value}
                    title={trans('map.info-control.copy')}
                    copiedTitle={trans('map.info-control.copied')}
                  />
                </div>
              ))}
            </div>
          </div>
        </DraggableItemPopup>
      );
    },
    [
      show,
      capturing,
      onScreenshot,
      onCopyImage,
      onPasteGoTo,
      info,
      centerDms,
      showDms,
      trans,
      panelBind,
    ],
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
