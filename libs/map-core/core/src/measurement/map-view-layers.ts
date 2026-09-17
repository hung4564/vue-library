/**
 * Pure MeasurementControl MapView paint/layout bootstrap (Vue ↔ React parity).
 * Hosts still add SDF images + wire onStart / onReset / marker / form views.
 */

import type { GeoJSONSourceSpecification, LayerSpecification } from 'maplibre-gl';
import type { MapSimple } from '../types';
import { MapView } from './model/viewMap';

/** Default highlight color for measurement line / fill / halo / markers. */
export const MEASUREMENT_DEFAULT_HIGHLIGHT_COLOR = '#004E98';

/** Image ids hosts must register before {@link createMeasurementMapView}. */
export const MEASUREMENT_MAP_VIEW_IMAGE = {
  /** SDF arrow for azimuth rotation symbols. */
  azimuthArrow: 'azimuth-arrow',
  /** Stretchable round chip behind center labels (legacy id spelling). */
  round: 'measurment-round',
} as const;

export type MeasurementMapViewLayerSpec = Pick<LayerSpecification, 'type'> &
  Record<string, unknown>;

/**
 * MapLibre layer specs for measurement geometry + labels.
 * Color defaults to {@link MEASUREMENT_DEFAULT_HIGHLIGHT_COLOR}.
 */
export function createMeasurementMapViewLayers(
  highlightColor: string = MEASUREMENT_DEFAULT_HIGHLIGHT_COLOR,
): MeasurementMapViewLayerSpec[] {
  return [
    {
      type: 'line',
      paint: {
        'line-color': highlightColor,
        'line-width': 2,
      },
    },
    {
      type: 'fill',
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'fill-color': highlightColor,
        'fill-opacity': 0.3,
      },
    },
    {
      type: 'symbol',
      filter: ['all', ['has', 'rotation'], ['!has', 'is_edge']],
      paint: { 'icon-color': highlightColor },
      layout: {
        'icon-size': 1.2,
        'icon-rotate': {
          type: 'identity',
          property: 'rotation',
        },
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-image': MEASUREMENT_MAP_VIEW_IMAGE.azimuthArrow,
        visibility: 'visible',
      },
    },
    {
      type: 'symbol',
      filter: [
        'all',
        ['has', 'is_label'],
        ['has', 'is_edge'],
        ['==', '$type', 'Point'],
      ],
      layout: {
        'text-field': '{text}',
        'text-size': 12,
        'text-rotate': ['get', 'text_rotate'],
        'text-rotation-alignment': 'map',
        'text-pitch-alignment': 'viewport',
        'text-offset': [0, 0],
        'text-anchor': 'center',
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
      paint: {
        'text-color': '#fff',
        'text-halo-color': highlightColor,
        'text-halo-width': 2,
      },
    },
    {
      type: 'symbol',
      filter: [
        'all',
        ['has', 'is_label'],
        ['!has', 'is_edge'],
        ['==', '$type', 'Point'],
      ],
      layout: {
        'text-field': '{text}',
        'text-offset': [
          'case',
          ['to-boolean', ['get', 'is_center']],
          ['literal', [0, 0]],
          ['literal', [0, 2]],
        ],
        'text-size': 14,
        'text-allow-overlap': true,
        'text-ignore-placement': true,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-image': MEASUREMENT_MAP_VIEW_IMAGE.round,
        'icon-text-fit': 'both',
      },
      paint: {
        'text-color': '#fff',
        'text-halo-color': highlightColor,
        'text-halo-width': 2,
      },
    },
  ];
}

/** Empty GeoJSON source options for measurement MapView.init. */
export function createMeasurementMapViewEmptySource(): {
  data: GeoJSONSourceSpecification;
} {
  return {
    data: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    },
  };
}

/**
 * Construct + init a measurement {@link MapView} with default paint/layout.
 * Hosts still register {@link MEASUREMENT_MAP_VIEW_IMAGE} assets and wire callbacks.
 */
export function createMeasurementMapView(
  map: MapSimple,
  options?: { highlightColor?: string },
): MapView {
  const color =
    options?.highlightColor ?? MEASUREMENT_DEFAULT_HIGHLIGHT_COLOR;
  return new MapView(map).init(
    createMeasurementMapViewLayers(color),
    createMeasurementMapViewEmptySource(),
  );
}
