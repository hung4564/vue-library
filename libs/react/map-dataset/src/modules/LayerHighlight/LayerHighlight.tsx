import type { WithMapPropType } from '@hungpvq/map-core';
import { EventClick, logHelper, type MapSimple } from '@hungpvq/map-core';
import type {
  HighlightHandle,
  IdentifySingleResult,
  IHighlightView,
} from '@hungpvq/map-dataset';
import {
  findSiblingOrNearestLeaf,
  handleMultiIdentifyGetFirst,
} from '@hungpvq/map-dataset';
import { defaultMapProps, useEventMap, useMap } from '@hungpvq/react-map-core';
import type { Feature } from 'geojson';
import type { GeoJSONFeature, MapMouseEvent, PointLike } from 'maplibre-gl';
import { useEffect, useMemo, useRef } from 'react';
import { loggerHighlight } from '../../logger';
import { useMapDataset, useMapDatasetHighlight } from '../../store';
import { createDefaultHighlight } from './helper';

export function LayerHighlight(
  props: WithMapPropType & {
    enableClick?: boolean;
    color?: string;
    durationMs?: number;
  },
) {
  const merged = { ...defaultMapProps, ...props };
  const durationMs = props.durationMs ?? 5000;
  const color = props.color ?? '#004E98';

  const handleHighlight = useRef<HighlightHandle | undefined>();
  const handleDefault = useMemo(() => createDefaultHighlight(color), [color]);
  const getAllRef = useRef<
    ReturnType<typeof useMapDataset>['getAllComponentsByType'] | null
  >(null);
  const onGetFeaturesRef = useRef<
    (point?: PointLike | [PointLike, PointLike]) => Promise<void>
  >(async () => undefined);

  const clickEvent = useRef(
    new EventClick().setHandler((e: MapMouseEvent) => {
      void onGetFeaturesRef.current(e.point);
    }),
  );

  const { mapId, callMap } = useMap(merged, undefined, (map) => {
    handleHighlight.current?.stopAnimation(map);
  });
  const { getAllComponentsByType } = useMapDataset(mapId);
  const {
    getFeatureHighlight,
    setFeatureHighlight,
    getDatesetHighlight,
    version: highlightVersion,
  } = useMapDatasetHighlight(mapId);

  getAllRef.current = getAllComponentsByType;

  const { add, remove } = useEventMap(mapId, clickEvent.current, false);

  useEffect(() => {
    if (props.enableClick) add();
    return () => remove();
  }, [props.enableClick, add, remove]);

  async function onGetFeatures(
    pointOrBox?: PointLike | [PointLike, PointLike],
  ) {
    const highlights =
      (getAllRef.current?.(
        'highlight',
      ) as IHighlightView[] | undefined) || [];
    const feature: IdentifySingleResult = await handleMultiIdentifyGetFirst(
      highlights as never,
      mapId,
      pointOrBox,
    );
    logHelper(loggerHighlight, mapId, 'LayerHighlight').debug(
      'onGetFeatures',
      feature,
    );
    if (!feature?.feature?.data) return;
    setFeatureHighlight(feature.feature.data, 'highlight', feature.identify);
  }
  onGetFeaturesRef.current = onGetFeatures;

  function stopAnimation(map: MapSimple) {
    if (!handleHighlight.current) return;
    handleHighlight.current.stopAnimation(map);
  }

  function clear() {
    setFeatureHighlight(undefined, '', undefined);
  }

  function updateHighlight(geojsonData?: Feature | GeoJSONFeature) {
    if (!geojsonData) return;

    const dataset = getDatesetHighlight();
    let highlightView: IHighlightView | undefined;
    if (dataset) {
      highlightView = findSiblingOrNearestLeaf(
        dataset,
        (d) => d.type === 'highlight',
      ) as unknown as IHighlightView;
    }

    callMap((map: MapSimple) => {
      stopAnimation(map);
      handleHighlight.current = handleDefault;
      handleDefault.setDataset(highlightView);
      if (
        highlightView &&
        'startAnimation' in highlightView &&
        'stopAnimation' in highlightView
      ) {
        handleHighlight.current = highlightView;
      }
      handleHighlight.current.setOnDone(map, () => {
        clear();
      });
      handleHighlight.current.startAnimation({
        map,
        feature: geojsonData as GeoJSONFeature,
        durationMs,
      });
    });
  }

  useEffect(() => {
    const value = getFeatureHighlight();
    if (!value) {
      callMap((map) => stopAnimation(map));
      return;
    }
    updateHighlight(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightVersion, mapId]);

  return null;
}
