import type { WithMapPropType } from '@hungpvq/map-core';
import {
  EventClick,
  EventMouseMove,
  logHelper,
  type MapSimple,
} from '@hungpvq/map-core';
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

function featureIdentity(feature?: Feature | GeoJSONFeature) {
  if (!feature) return undefined;
  const id = feature.id ?? feature.properties?.id;
  return id != null ? String(id) : undefined;
}

export function LayerHighlight(
  props: WithMapPropType & {
    enableClick?: boolean;
    enableHover?: boolean;
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
  const clickRequestIdRef = useRef(0);
  const hoverRequestIdRef = useRef(0);
  const lastHoverIdRef = useRef<string | undefined>();
  const onGetFeaturesRef = useRef<
    (
      point?: PointLike | [PointLike, PointLike],
      source?: 'highlight' | 'hover',
    ) => Promise<void>
  >(async () => undefined);

  const clickEvent = useRef(
    new EventClick().setHandler((e: MapMouseEvent) => {
      void onGetFeaturesRef.current(e.point, 'highlight');
    }),
  );
  const hoverEvent = useRef(
    new EventMouseMove().setClassPointer('').setHandler((e: MapMouseEvent) => {
      void onGetFeaturesRef.current(e.point, 'hover');
    }),
  );

  const { mapId, callMap } = useMap(merged, undefined, (map) => {
    handleHighlight.current?.stopAnimation(map);
    handleDefault.stopAnimation(map);
  });
  const { getAllComponentsByType } = useMapDataset(mapId);
  const {
    getFeatureHighlight,
    setFeatureHighlight,
    getDatesetHighlight,
    getHighlightSource,
    version: highlightVersion,
  } = useMapDatasetHighlight(mapId);

  getAllRef.current = getAllComponentsByType;

  const { add: addClick, remove: removeClick } = useEventMap(
    mapId,
    clickEvent.current,
    false,
  );
  const { add: addHover, remove: removeHover } = useEventMap(
    mapId,
    hoverEvent.current,
    false,
  );

  useEffect(() => {
    if (props.enableClick) addClick();
    return () => removeClick();
  }, [props.enableClick, addClick, removeClick]);

  useEffect(() => {
    if (props.enableHover) addHover();
    return () => removeHover();
  }, [props.enableHover, addHover, removeHover]);

  async function onGetFeatures(
    pointOrBox?: PointLike | [PointLike, PointLike],
    source: 'highlight' | 'hover' = 'highlight',
  ) {
    const current =
      source === 'highlight'
        ? ++clickRequestIdRef.current
        : ++hoverRequestIdRef.current;
    if (source === 'highlight') {
      hoverRequestIdRef.current += 1;
      lastHoverIdRef.current = undefined;
      callMap((map) => stopAnimation(map));
    }
    const highlights =
      (getAllRef.current?.('highlight') as IHighlightView[] | undefined) || [];
    const feature: IdentifySingleResult | undefined =
      await handleMultiIdentifyGetFirst(
        highlights as never,
        mapId,
        pointOrBox,
      );
    if (source === 'highlight' && current !== clickRequestIdRef.current) return;
    if (source === 'hover' && current !== hoverRequestIdRef.current) return;
    logHelper(loggerHighlight, mapId, 'LayerHighlight').debug(
      'onGetFeatures',
      feature,
    );
    const data = feature?.feature?.data;
    if (!data) {
      if (source === 'hover') {
        lastHoverIdRef.current = undefined;
        if (getHighlightSource() === 'hover') {
          setFeatureHighlight(undefined, 'hover', undefined);
        }
        return;
      }
      setFeatureHighlight(undefined, 'highlight', undefined);
      return;
    }
    if (source === 'hover') {
      const id = featureIdentity(data);
      if (id && id === lastHoverIdRef.current && getHighlightSource() === 'hover') {
        return;
      }
      lastHoverIdRef.current = id;
    }
    setFeatureHighlight(data, source, feature?.identify);
  }
  onGetFeaturesRef.current = onGetFeatures;

  function stopAnimation(map: MapSimple) {
    handleHighlight.current?.stopAnimation(map);
    handleDefault.stopAnimation(map);
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
