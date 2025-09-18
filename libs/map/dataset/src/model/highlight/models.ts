import { mergeFilters, type MapSimple } from '@hungpvq/shared-map';
import type {
  GeoJSONFeature,
  GeoJSONSource,
  LayerSpecification,
} from 'maplibre-gl';
import { createWithDataHelper } from '../../extra';
import { createNamedComponent } from '../base';
import { createDatasetLeaf } from '../dataset.base.function';
import { findFirstLeafByType } from '../visitors';
import type { IHighlightView } from './types';
export function createDatasetPartHighlightComponent(
  data?: Partial<LayerSpecification>,
): IHighlightView {
  const base = createDatasetLeaf('');
  const dataHelper = createWithDataHelper(data);

  return createNamedComponent('HighlightComponent', {
    ...base,
    ...dataHelper,
    get type() {
      return 'highlight';
    },
    highlight: (feature) => {
      const source = findFirstLeafByType(base, 'source');
      const source_id = (source as any)?.getSourceId();
      if (!feature?.id) {
        return undefined;
      }
      return {
        source: source_id,
        filter: feature ? ['==', 'id', feature?.id] : undefined,
        ...dataHelper.getData(),
      };
    },
  });
}
export function createDatasetPartChangeColorHighlightComponent(
  data?: Partial<LayerSpecification>,
  config: { color: string } = { color: '#880808' },
): IHighlightView {
  const { color } = config;
  const base = createDatasetLeaf('');
  const dataHelper = createWithDataHelper(data);

  const layerIds = {
    point: base.id + '-layer-highlighted-point',
    line: base.id + '-layer-highlighted-line',
    polygon: base.id + '-layer-highlighted-polygon',
  };

  const layersDefault: Record<string, Partial<LayerSpecification>> = {
    point: {
      type: 'circle',
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-radius': 6,
        'circle-color': color,
        'circle-opacity': 0.7,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    },
    line: {
      type: 'line',
      filter: ['==', '$type', 'LineString'],
      paint: {
        'line-color': color,
        'line-width': 4,
        'line-dasharray': [2, 4],
      },
    },
    polygon: {
      type: 'fill',
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'fill-color': color,
        'fill-opacity': 0.4,
      },
    },
  };

  // quản lý animation theo map.id
  const animStates: Record<
    string,
    {
      startTime: any;
      frameId: number | null;
      timeoutId: any;
    }
  > = {};

  function ensureSource(map: MapSimple, feature?: GeoJSONFeature) {
    const sourceLeaf = findFirstLeafByType(base, 'source');
    if (sourceLeaf) {
      // đã có source trong dataset
      return (sourceLeaf as any).getSourceId();
    }
    // chưa có -> tự tạo source geojson tạm
    const sourceId = base.id + '-source-highlighted';
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: feature || {
          type: 'FeatureCollection',
          features: [],
        },
      });
    } else {
      const source = map.getSource(sourceId) as GeoJSONSource;
      source.setData(
        feature || {
          type: 'FeatureCollection',
          features: [],
        },
      );
    }
    return sourceId;
  }

  function ensureLayers(
    map: MapSimple,
    sourceId: string,
    feature?: GeoJSONFeature,
  ) {
    (Object.keys(layerIds) as (keyof typeof layerIds)[]).forEach((key) => {
      const id = layerIds[key];
      const baseLayer = layersDefault[key];
      // chỉ merge filter theo id khi feature.id có giá trị
      const highlightFilter =
        feature && feature.id != null ? ['==', 'id', feature.id] : undefined;
      const mergedFilter = mergeFilters(
        (baseLayer as any).filter,
        highlightFilter,
      );

      if (!map.getLayer(id)) {
        map.addLayer({
          id,
          source: sourceId,
          ...baseLayer,
          ...dataHelper.getData(),
          filter: mergedFilter,
        } as LayerSpecification);
      } else {
        map.setFilter(id, mergedFilter);
      }
    });
  }

  function animate(map: MapSimple) {
    const id = (map as any).id || 'default';
    const state = animStates[id];
    if (!state) return;

    const t = (performance.now() - state.startTime) / 1000; // giây

    // HSL hue shift
    const hue = (t * 60) % 360; // 60 độ/giây
    const color = `hsl(${hue}, 80%, 50%)`;

    // Point: stroke color shift
    map.setPaintProperty(layerIds.point, 'circle-stroke-color', color);
    // cũng có thể đổi radius nhẹ
    const radius = 6 + Math.sin(t * 3) * 2;
    map.setPaintProperty(layerIds.point, 'circle-radius', radius);

    // Line: line-color shift
    map.setPaintProperty(layerIds.line, 'line-color', color);

    // Polygon: fill-color shift + opacity wave
    const opacity = 0.4 + 0.3 * Math.sin(t * 2);
    map.setPaintProperty(layerIds.polygon, 'fill-color', color);
    map.setPaintProperty(layerIds.polygon, 'fill-opacity', opacity);

    state.frameId = requestAnimationFrame(() => animate(map));
  }

  function startAnimation(map: MapSimple, durationMs = 5000) {
    const id = (map as any).id || 'default';
    animStates[id] = {
      frameId: null,
      timeoutId: null,
      startTime: performance.now(),
    };
    animate(map);
    if (durationMs && durationMs > 0) {
      animStates[id].timeoutId = setTimeout(
        () => stopAnimation(map),
        durationMs,
      );
    }
  }

  function stopAnimation(map: MapSimple) {
    const id = (map as any).id || 'default';
    const state = animStates[id];
    if (!state) return;
    if (state.frameId) cancelAnimationFrame(state.frameId);
    if (state.timeoutId) clearTimeout(state.timeoutId);
    delete animStates[id];

    (Object.keys(layerIds) as (keyof typeof layerIds)[]).forEach((key) => {
      const layerId = layerIds[key];
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    });
  }

  function handleHighlight(
    map: MapSimple,
    feature?: GeoJSONFeature,
    durationMs = 5000,
  ) {
    const sourceId = ensureSource(map, feature);
    ensureLayers(map, sourceId, feature);
    Object.values(layerIds).forEach((id) => {
      if (map.getLayer(id)) {
        map.moveLayer(id);
      }
    });

    if (feature) {
      startAnimation(map, durationMs);
    } else {
      stopAnimation(map);
    }
  }

  return createNamedComponent('HighlightComponent', {
    ...base,
    ...dataHelper,
    get type() {
      return 'highlight';
    },
    handleHighlight,
    startAnimation,
    stopAnimation,
  });
}
