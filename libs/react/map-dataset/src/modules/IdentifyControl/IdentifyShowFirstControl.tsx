import type { WithMapPropType } from '@hungpvq/map-core';
import { EventClick, logHelper, runMapControlAction } from '@hungpvq/map-core';
import type {
  IDataset,
  IdentifyMultiResult,
  IIdentifyView,
} from '@hungpvq/map-dataset';
import {
  handleMultiIdentifyGetFirst,
  IDENTIFY_CONTROL,
  identifyResolver,
} from '@hungpvq/map-dataset';
import {
  defaultMapProps,
  useEventMap,
  useMap,
} from '@hungpvq/react-map-core';
import type { MapMouseEvent } from 'maplibre-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { loggerIdentify } from '../../logger';
import { useMapDataset } from '../../store';

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
    const loadStartedAt = performance.now();
    const pointOrBox = e.point;
    setLoading(true);
    logHelper(loggerIdentify, mapId, 'FIRST', 'IdentifyShowFirstControl').info(
      'loading:start',
      { pointOrBox },
    );
    try {
      logHelper(
        loggerIdentify,
        mapId,
        'FIRST',
        'IdentifyShowFirstControl',
      ).debug('onGetFeatures', { pointOrBox });
      const record = await handleMultiIdentifyGetFirst(
        viewsRef.current,
        mapId,
        pointOrBox,
      );
      logHelper(
        loggerIdentify,
        mapId,
        'FIRST',
        'IdentifyShowFirstControl',
      ).debug('onGetFeatures', { record });
      onSelectFeatures(record, e);
      logHelper(
        loggerIdentify,
        mapId,
        'FIRST',
        'IdentifyShowFirstControl',
      ).info('loading:done', {
        durationMs: Math.round(performance.now() - loadStartedAt),
        featureCount: record?.features?.length ?? 0,
        empty: !record?.features?.length,
      });
    } finally {
      setLoading(false);
    }
  }

  function onSelectFeatures(
    record: IdentifyMultiResult | undefined,
    event?: MapMouseEvent,
  ) {
    logHelper(loggerIdentify, mapId, 'FIRST', 'IdentifyShowFirstControl').debug(
      'onSelectFeatures',
      { record },
    );
    const records =
      record?.features?.length ? [record] : ([] as IdentifyMultiResult[]);
    identifyResolver
      .execute({
        records,
        mapId: mapId,
        event,
        singleLayer: true,
        preferResultControl: preferResultControlRef.current,
      })
      .then((res) =>
        logHelper(
          loggerIdentify,
          mapId,
          'FIRST',
          'IdentifyShowFirstControl',
        ).debug('onSelectFeaturesResult', res),
      );
  }

  onMapClickRef.current = (e: MapMouseEvent) => {
    logHelper(loggerIdentify, mapId, 'FIRST', 'IdentifyShowFirstControl').debug(
      'onMapClick',
      { event: e },
    );
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
