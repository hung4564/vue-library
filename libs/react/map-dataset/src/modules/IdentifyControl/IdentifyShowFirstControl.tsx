import type { WithMapPropType } from '@hungpvq/map-core';
import { runMapControlAction } from '@hungpvq/map-core';
import { EventClick } from '@hungpvq/map-core/event';
import type { IDataset } from '@hungpvq/map-dataset';
import type { IIdentifyView } from '@hungpvq/map-dataset/identify';
import {
  IDENTIFY_CONTROL,
  runIdentifyShowFirst,
} from '@hungpvq/map-dataset/identify';
import {
  defaultMapProps,
  useEventMap,
  useMap,
} from '@hungpvq/react-map-core';
import type { MapMouseEvent } from 'maplibre-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMapDataset } from '../../store/dataset-api';

export function IdentifyShowFirstControl(
  props: WithMapPropType & {
    /**
     * Always open Identify Result panel (skip auto show-detail / attribute-table).
     */
    preferResultControl?: boolean;
  },
) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, callMap } = useMap({
    ...merged,
    controlId: IDENTIFY_CONTROL.id,
  });
  const { getAllComponentsByType, datasetVersion } = useMapDataset(mapId);
  const [views, setViews] = useState<Array<IIdentifyView & IDataset>>([]);
  const viewsRef = useRef(views);
  viewsRef.current = views;
  const loadingRef = useRef(false);
  const preferResultControlRef = useRef(!!props.preferResultControl);
  preferResultControlRef.current = !!props.preferResultControl;
  const callMapRef = useRef(callMap);
  callMapRef.current = callMap;

  useEffect(() => {
    const next =
      getAllComponentsByType<IIdentifyView & IDataset>('identify') || [];
    setViews((prev) => {
      if (
        prev.length === next.length &&
        prev.every((view, index) => view === next[index])
      ) {
        return prev;
      }
      return next;
    });
  }, [datasetVersion, mapId, getAllComponentsByType]);

  const setLoading = (value: boolean) => {
    loadingRef.current = value;
    callMapRef.current((map) => {
      map.getCanvas().style.cursor = value ? 'wait' : '';
    });
    runMapControlAction(
      mapId,
      IDENTIFY_CONTROL.id,
      IDENTIFY_CONTROL.actionSetLoading,
      value,
    );
  };

  const onMapClickRef = useRef<(e: MapMouseEvent) => void>(() => undefined);

  const clickEvent = useMemo(
    () =>
      new EventClick().setHandler((e: MapMouseEvent) => {
        onMapClickRef.current(e);
      }),
    [],
  );

  const { add: addEventClick, remove: removeEventClick } = useEventMap(
    mapId,
    clickEvent,
    false,
  );

  async function onGetFeatures(e: MapMouseEvent) {
    if (loadingRef.current) return;
    setLoading(true);
    try {
      await runIdentifyShowFirst({
        identifies: viewsRef.current,
        mapId,
        pointOrBox: e.point,
        event: e,
        preferResultControl: preferResultControlRef.current,
      });
    } finally {
      setLoading(false);
    }
  }

  onMapClickRef.current = (e: MapMouseEvent) => {
    void onGetFeatures(e);
  };

  useEffect(() => {
    addEventClick();
    return () => {
      removeEventClick();
      if (loadingRef.current) setLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addEventClick, removeEventClick]);

  return null;
}
