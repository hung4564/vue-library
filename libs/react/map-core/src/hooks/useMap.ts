import type { MapFCOnUseMap, MapSimple } from '@hungpvq/map-core';
import type {
  ControlLayout,
  ResolvedControlLayout,
  WithMapPropType,
} from '@hungpvq/map-core';
import { resolveControlLayout, subscribeMapReady } from '@hungpvq/map-core';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MapContext } from '../context/MapContext';
import { getMap } from '../store/store';

export function useResolvedControlLayout(
  controlLayout?: ControlLayout,
): ResolvedControlLayout {
  const context = useContext(MapContext);
  return resolveControlLayout(controlLayout, {
    isMobile: !!context?.isMobile,
    buttonInMobile: context?.buttonInMobile ?? 'button',
  });
}

export const useMap = (
  props: WithMapPropType = {},
  onInit?: MapFCOnUseMap,
  onDestroy?: MapFCOnUseMap,
) => {
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

  const controlLayout = useResolvedControlLayout(props.controlLayout);

  if (
    autoOrderRef.current === undefined &&
    (props.controlOrder === undefined || props.controlOrder === 0) &&
    registerOrder
  ) {
    const key =
      controlLayout === 'toolbar' ? 'toolbar' : `${props.position}`;
    autoOrderRef.current = registerOrder(key);
  }

  const order =
    props.controlOrder && +props.controlOrder > 0
      ? +props.controlOrder
      : (autoOrderRef.current ?? 1) * 10;

  useEffect(() => {
    if (!mapId) return;
    let cancelled = false;
    const unsubscribe = subscribeMapReady(mapId, async (_map) => {
      if (cancelled) return;
      setMapInstance(_map);
      const init = onInitRef.current;
      if (init instanceof Function) {
        await init(_map);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [mapId]);

  useEffect(() => {
    return () => {
      const destroy = onDestroyRef.current;
      if (destroy instanceof Function && mapId) {
        const map = getMap(mapId);
        if (map) {
          void destroy(map);
        }
      }
    };
  }, [mapId]);

  function callMap(cb: MapFCOnUseMap) {
    if (!mapId) return undefined;
    return getMap(mapId, cb);
  }

  const dragId = props.dragId || context?.dragId || '';

  const moduleContainerProps = useMemo(
    () => ({
      // Use resolved ids — `defaultMapProps.mapId/dragId` are '' and must not
      // mask MapContext when ModuleContainer / portals run under a built
      // multi-entry bundle (duplicate context copies).
      mapId,
      dragId,
      btnWidth: props.btnWidth,
      position: props.position,
      controlVisible: props.controlVisible,
      controlLayout,
      controlId: props.controlId,
      controlOrder: order,
    }),
    [
      mapId,
      dragId,
      props.btnWidth,
      props.position,
      props.controlVisible,
      controlLayout,
      props.controlId,
      order,
    ],
  );

  return {
    callMap,
    mapId,
    mapInstance,
    moduleContainerProps,
    order,
    controlLayout,
  };
};

export const defaultMapProps: Partial<WithMapPropType> = {
  mapId: '',
  dragId: '',
  btnWidth: 40,
  position: 'bottom-right',
  controlVisible: true,
};
