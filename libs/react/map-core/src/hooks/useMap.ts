import type { MapFCOnUseMap, MapSimple } from '@hungpvq/map-core';
import type { WithMapPropType } from '@hungpvq/map-core';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MapContext } from '../context/MapContext';
import { getMap } from '../store/store';

export const useMap = (
  props: WithMapPropType = {},
  onInit?: MapFCOnUseMap,
  onDestroy?: MapFCOnUseMap,
) => {
  // Optional like Vue inject — BaseMapCard can run outside <Map> with mapId prop
  const context = useContext(MapContext);
  const mapId = useMemo(() => {
    return props.mapId || context?.mapId || '';
  }, [props.mapId, context?.mapId]);

  const [mapInstance, setMapInstance] = useState<
    MapSimple | MapSimple[] | undefined
  >(undefined);

  const registerOrder = context?.registerModuleOrder;
  const autoOrderRef = useRef<number | undefined>(undefined);
  const onInitRef = useRef(onInit);
  const onDestroyRef = useRef(onDestroy);
  onInitRef.current = onInit;
  onDestroyRef.current = onDestroy;

  // Register order synchronously during render (matches Vue setup)
  if (
    autoOrderRef.current === undefined &&
    (props.controlOrder === undefined || props.controlOrder === 0) &&
    registerOrder
  ) {
    const key =
      props.controlLayout === 'toolbar'
        ? props.controlLayout
        : `${props.position}`;
    autoOrderRef.current = registerOrder(key);
  }

  const order =
    props.controlOrder && +props.controlOrder > 0
      ? +props.controlOrder
      : (autoOrderRef.current ?? 1) * 10;

  useEffect(() => {
    if (!mapId) return;
    getMap(mapId, async (_map) => {
      setMapInstance(_map);
      const init = onInitRef.current;
      if (init instanceof Function) {
        await init(_map);
      }
    });
  }, [mapId]);

  useEffect(() => {
    return () => {
      const destroy = onDestroyRef.current;
      if (destroy instanceof Function && mapId) {
        getMap(mapId, async (_map) => {
          await destroy(_map);
        });
      }
    };
  }, [mapId]);

  function callMap(cb: MapFCOnUseMap) {
    return getMap(mapId, cb);
  }

  const moduleContainerProps = useMemo(
    () => ({
      mapId: props.mapId,
      dragId: props.dragId || context?.dragId,
      btnWidth: props.btnWidth,
      position: props.position,
      controlVisible: props.controlVisible,
      controlLayout: props.controlLayout,
      order: order,
      top: props.top,
      bottom: props.bottom,
      left: props.left,
      right: props.right,
    }),
    [
      props.mapId,
      props.dragId,
      props.btnWidth,
      props.position,
      props.controlVisible,
      props.controlLayout,
      props.top,
      props.bottom,
      props.left,
      props.right,
      order,
      context?.dragId,
    ],
  );

  return {
    callMap,
    mapId,
    mapInstance,
    moduleContainerProps,
    order,
  };
};

export const defaultMapProps: Partial<WithMapPropType> = {
  mapId: '',
  dragId: '',
  btnWidth: 40,
  position: 'bottom-right',
  controlVisible: true,
};
