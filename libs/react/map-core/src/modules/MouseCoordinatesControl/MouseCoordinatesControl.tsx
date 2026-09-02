import type { MapSimple, WithMapPropType } from '@hungpvq/map-core';
import { mdiCached, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import { debounce } from 'lodash';
import type { MapMouseEvent } from 'maplibre-gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCoordinate } from '../../extra/crs';
import { defaultMapProps, useMap } from '../../hooks';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';

function getDecimalRoundNum(d: number) {
  const multiplier = Math.pow(10, Math.ceil(-Math.log(d) / Math.LN10));
  return Math.round(d * multiplier) / multiplier;
}

function getRoundNum(num: number) {
  const pow10 = Math.pow(10, `${Math.floor(num)}`.length - 1);
  let d = num / pow10;
  d =
    d >= 10
      ? 10
      : d >= 5
        ? 5
        : d >= 3
          ? 3
          : d >= 2
            ? 2
            : d >= 1
              ? 1
              : getDecimalRoundNum(d);
  return pow10 * d;
}

function setScale(container: HTMLElement, maxDistance: number, unit: string) {
  const distance = getRoundNum(maxDistance);
  if (container) container.innerHTML = `${distance}&nbsp;${unit}`;
}

export interface MouseCoordinatesControlProps extends WithMapPropType {
  hideZoom?: boolean;
  hideScale?: boolean;
  hideCoordinates?: boolean;
}

export function MouseCoordinatesControl(props: MouseCoordinatesControlProps) {
  const mergedProps = {
    ...defaultMapProps,
    ...props,
    hideZoom: props.hideZoom || false,
    hideScale: props.hideScale || false,
    hideCoordinates: props.hideCoordinates || false,
  };
  const scaleRef = useRef<HTMLDivElement | null>(null);
  const [currentPoint, setCurrentPoint] = useState('');
  const [lngLat, setLngLat] = useState({ latitude: 0, longitude: 0 });
  const [currentZoom, setCurrentZoom] = useState(0);
  const [isDMS, setIsDMS] = useState(false);
  const callMapRef = useRef<((cb: (map: MapSimple) => void) => void) | null>(
    null,
  );
  const formatCoordinateRef = useRef<
    | ((
        coords: { latitude: number; longitude: number },
        useDMS: boolean,
      ) => { longitude: string; latitude: string })
    | null
  >(null);
  const isDMSRef = useRef(isDMS);
  const lngLatRef = useRef(lngLat);
  const hideScaleRef = useRef(mergedProps.hideScale);
  hideScaleRef.current = mergedProps.hideScale;
  isDMSRef.current = isDMS;
  lngLatRef.current = lngLat;

  const updateScale = useCallback((map: MapSimple, container: HTMLElement) => {
    if (hideScaleRef.current || !container) return;
    const maxWidth = 100;
    const y = map.getContainer().clientHeight / 2;
    const left = map.unproject([0, y]);
    const right = map.unproject([maxWidth, y]);
    const maxMeters = left.distanceTo(right);
    if (maxMeters >= 1000) {
      setScale(container, maxMeters / 1000, 'km');
    } else {
      setScale(container, maxMeters, 'm');
    }
  }, []);

  const syncScale = useCallback(
    (map?: MapSimple) => {
      const scaleEl = scaleRef.current;
      if (!scaleEl || hideScaleRef.current) return;
      if (map) {
        updateScale(map, scaleEl);
        return;
      }
      callMapRef.current?.((m) => updateScale(m, scaleEl));
    },
    [updateScale],
  );

  /** Portal mounts the scale node after onInit — update as soon as the element exists. */
  const setScaleEl = useCallback(
    (el: HTMLDivElement | null) => {
      scaleRef.current = el;
      if (el) syncScale();
    },
    [syncScale],
  );

  const onMouseMove = useMemo(
    () =>
      debounce((e: MapMouseEvent) => {
        const point = [e.lngLat.lng, e.lngLat.lat];
        const newLngLat = { latitude: point[1], longitude: point[0] };
        setLngLat(newLngLat);
        if (formatCoordinateRef.current) {
          const formatted = formatCoordinateRef.current(
            newLngLat,
            isDMSRef.current,
          );
          setCurrentPoint(
            formatted.longitude + ', &nbsp;' + formatted.latitude,
          );
        }
      }, 15),
    [],
  );

  const onZoomEnd = useCallback(() => {
    callMapRef.current?.((map) => {
      setCurrentZoom(+map.getZoom().toFixed(2));
    });
  }, []);

  const onMapMove = useCallback(() => {
    syncScale();
  }, [syncScale]);

  const onInit = useCallback(
    (map: MapSimple) => {
      setCurrentZoom(+map.getZoom().toFixed(2));
      map.on('zoomend', onZoomEnd);
      map.on('mousemove', onMouseMove);
      map.on('move', onMapMove);
      const center = map.getCenter();
      const centerLngLat = { latitude: center.lat, longitude: center.lng };
      setLngLat(centerLngLat);
      if (formatCoordinateRef.current) {
        const point = formatCoordinateRef.current(
          centerLngLat,
          isDMSRef.current,
        );
        setCurrentPoint(point.longitude + ', &nbsp;' + point.latitude);
      }
      syncScale(map);
      // Portal may not have mounted yet; retry after paint like Vue nextTick.
      requestAnimationFrame(() => syncScale(map));
    },
    [onZoomEnd, onMouseMove, onMapMove, syncScale],
  );

  const onDestroy = useCallback(
    (map: MapSimple) => {
      map.off('zoomend', onZoomEnd);
      map.off('mousemove', onMouseMove);
      map.off('move', onMapMove);
    },
    [onZoomEnd, onMouseMove, onMapMove],
  );

  const { callMap, mapId, moduleContainerProps } = useMap(
    mergedProps,
    onInit,
    onDestroy,
  );
  callMapRef.current = callMap;

  const { format: formatCoordinate } = useCoordinate(mapId);

  const changePixelValueRef = useRef<() => void>(() => {
    return;
  });

  useEffect(() => {
    formatCoordinateRef.current = formatCoordinate;
  }, [formatCoordinate]);

  const changePixelValue = useCallback(() => {
    if (formatCoordinateRef.current) {
      const point = formatCoordinateRef.current(
        lngLatRef.current,
        isDMSRef.current,
      );
      setCurrentPoint(point.longitude + ', &nbsp;' + point.latitude);
    }
  }, []);

  useEffect(() => {
    changePixelValueRef.current = changePixelValue;
  }, [changePixelValue]);

  useEffect(() => {
    changePixelValue();
  }, [isDMS, lngLat, changePixelValue]);

  function changeDisplayTypePixelValue() {
    setIsDMS((prev) => !prev);
  }

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <div className="button-container mouse-coordinates-container">
          {!mergedProps.hideZoom && (
            <div className="mouse-coordinates-part zoom-part">
              <div className="mouse-coordinates-zoom">
                <span title="Current Zoom" className="icon">
                  <Icon size={'16px'} path={mdiMagnify} />
                </span>
                <div style={{ marginLeft: '4px' }}>{currentZoom}</div>
              </div>
            </div>
          )}
          {!mergedProps.hideCoordinates && (
            <div className="mouse-coordinates-part coordinates-part">
              <div className="mouse-coordinates-point">
                <div
                  className="selectable"
                  dangerouslySetInnerHTML={{ __html: currentPoint }}
                  style={{
                    minWidth: isDMS ? '220px' : '100px',
                    marginLeft: '4px',
                  }}
                />
                <i
                  title={
                    isDMS
                      ? 'DMS <=> Latitude, Longitude'
                      : 'Latitude, Longitude <=> DMS'
                  }
                  style={{ marginLeft: '4px', cursor: 'pointer' }}
                  onClick={changeDisplayTypePixelValue}
                  className="icon icon-clickable"
                >
                  <Icon size="16px" path={mdiCached} />
                </i>
              </div>
            </div>
          )}
          {!mergedProps.hideScale && (
            <div className="mouse-coordinates-part scale-part">
              <div ref={setScaleEl} className="scale-custom"></div>
            </div>
          )}
        </div>
      }
    ></ModuleContainer>
  );
}
