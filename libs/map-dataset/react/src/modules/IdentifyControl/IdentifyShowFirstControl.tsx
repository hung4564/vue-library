import type { WithMapPropType } from '@hungpvq/map-core';
import { runMapControlAction } from '@hungpvq/map-core';
import { EventClick } from '@hungpvq/map-core/event';
import type { IDataset } from '@hungpvq/map-dataset';
import type { IIdentifyView } from '@hungpvq/map-dataset/identify';
import {
  IDENTIFY_CONTROL,
  isIdentifyAbortError,
  runIdentifyShowFirst,
} from '@hungpvq/map-dataset/identify';
import { defaultMapProps, useEventMap, useMap } from '@hungpvq/react-map-core';
import type { MapMouseEvent } from 'maplibre-gl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useMapDataset } from '../../store/dataset-api';

export function IdentifyShowFirstControl(props: WithMapPropType) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, callMap } = useMap({
    ...merged,
    controlId: IDENTIFY_CONTROL.id,
  });
  const { getAllComponentsByType, datasetVersion } = useMapDataset(mapId);
  const [views, setViews] = useState<Array<IIdentifyView & IDataset>>([]);
  const viewsRef = useRef(views);
  viewsRef.current = views;
  const callMapRef = useRef(callMap);
  callMapRef.current = callMap;
  const queryAbortRef = useRef<AbortController | null>(null);
  const queryGenerationRef = useRef(0);

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
    queryAbortRef.current?.abort();
    const ac = new AbortController();
    queryAbortRef.current = ac;
    const generation = ++queryGenerationRef.current;

    setLoading(true);
    try {
      await runIdentifyShowFirst({
        identifies: viewsRef.current,
        mapId,
        pointOrBox: e.point,
        event: e,
        signal: ac.signal,
        requestId: generation,
      });
    } catch (error) {
      if (isIdentifyAbortError(error) || ac.signal.aborted) {
        return;
      }
      // Loading cleared in finally; avoid unhandled rejection from void click handler.
    } finally {
      if (queryAbortRef.current === ac) {
        queryAbortRef.current = null;
      }
      if (generation === queryGenerationRef.current) {
        setLoading(false);
      }
    }
  }

  onMapClickRef.current = (e: MapMouseEvent) => {
    void onGetFeatures(e);
  };

  useEffect(() => {
    addEventClick();
    return () => {
      queryAbortRef.current?.abort();
      removeEventClick();
      setLoading(false);
    };
  }, [mapId]);

  return null;
}
