import type { MapFCOnUseMap, MapSimple } from '@hungpvq/map-core';
import type { WithMapPropType } from '@hungpvq/map-core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getMap } from '../store/store';
import { useMapContext } from '../context/MapContext';

export const useMap = (
  props: WithMapPropType = {},
  onInit?: MapFCOnUseMap,
  onDestroy?: MapFCOnUseMap,
) => {
  const context = useMapContext();
  const mapId = useMemo(() => {
    return props.mapId || context.mapId || '';
  }, [props.mapId, context.mapId]);

  const [mapInstance, setMapInstance] = useState<
    MapSimple | MapSimple[] | undefined
  >(undefined);

  const registerOrder = context.registerModuleOrder;
  const autoOrderRef = useRef<number | undefined>(undefined);

  // Calculate auto order on mount
  useEffect(() => {
    if (
      (props.controlOrder === undefined || props.controlOrder === 0) &&
      registerOrder
    ) {
      const key =
        props.controlLayout === 'toolbar'
          ? props.controlLayout
          : `${props.position}`;
      autoOrderRef.current = registerOrder(key);
    }
  }, [props.controlOrder, props.controlLayout, props.position, registerOrder]);

  const order = useMemo(() => {
    if (props.controlOrder && +props.controlOrder > 0) {
      return +props.controlOrder;
    }
    return (autoOrderRef.current ?? 1) * 10;
  }, [props.controlOrder, autoOrderRef.current]);

  useEffect(() => {
    getMap(mapId, async (_map) => {
      setMapInstance(_map);
      if (onInit instanceof Function) {
        await onInit(_map);
      }
    });
  }, [mapId]);

  useEffect(() => {
    return () => {
      if (onDestroy instanceof Function) {
        getMap(mapId, async (_map) => {
          await onDestroy(_map);
        });
      }
    };
  }, [mapId, onDestroy]);

  function callMap(cb: MapFCOnUseMap) {
    return getMap(mapId, cb);
  }

  const moduleContainerProps = useMemo(
    () => ({
      mapId: props.mapId,
      dragId: props.dragId,
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
