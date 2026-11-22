import type { MapSimple } from '@hungpvq/map-core';
import type { Feature, FeatureCollection } from 'geojson';
import type {
  FilterSpecification,
  GeoJSONFeature,
  MapGeoJSONFeature,
  PointLike,
} from 'maplibre-gl';

import type { IDataset } from '../interfaces/dataset.base';

export type HighlightGeoJson = Feature | FeatureCollection | GeoJSONFeature;

export type HighlightFilterCreator =
  string | ((feature?: HighlightGeoJson) => FilterSpecification | undefined);

export type HighlightLayerIds = {
  point: string;
  line: string;
  polygon: string;
  pointHalo?: string;
  lineHalo?: string;
  polygonHalo?: string;
  [key: string]: string | undefined;
};

export type HighlightMode =
  | 'default'
  | 'marker'
  | 'outline'
  | 'fill'
  | 'pulse'
  | 'changeColor'
  | 'custom';

export type HighlightSource =
  | 'pointer'
  | 'hover'
  | 'identify'
  | 'attribute-table'
  | 'detail'
  | (string & NonNullable<unknown>);

export type HighlightStyle = {
  mode?: HighlightMode;
  color?: string;
  durationMs?: number;
  paint?: {
    pointRadius?: number;
    lineWidth?: number;
    fillOpacity?: number;
    outlineWidth?: number;
  };
  filterCreator?: HighlightFilterCreator;
  stateKey?: string;
  animate?: HighlightAnimateFn;
  createDefaultState?: () => Record<string, unknown>;
  layerIds?: HighlightLayerIds | ((baseId: string) => HighlightLayerIds);
};

export type HighlightAnimState = {
  frameId: number | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  radius?: number;
  grow?: boolean;
  dashOffset?: number;
  blinkAlpha?: number;
  blinkDir?: number;
  [key: string]: unknown;
};

export type HighlightAnimateFn = (args: {
  map: MapSimple;
  layerIds: HighlightLayerIds;
  state: HighlightAnimState;
}) => void;

export type HighlightDataContext = {
  mapId: string;
  map: MapSimple;
  dataset?: IDataset;
  input?:
    | HighlightGeoJson
    | MapGeoJSONFeature
    | {
        id: string | number;
        properties?: object;
        geometry?: Feature['geometry'];
      };
  source?: HighlightSource;
  signal?: AbortSignal;
};

export type HighlightDataSource =
  | { type: 'local' }
  | {
      type: 'vector-tile';
      source?: string;
      sourceLayer?: string;
      promoteId?: string;
      strategy?: 'feature-state' | 'query';
    }
  | {
      type: 'resolver';
      resolve: (
        ctx: HighlightDataContext,
      ) =>
        | HighlightGeoJson
        | FeatureCollection
        | null
        | Promise<HighlightGeoJson | FeatureCollection | null>;
    };

export type HighlightSelectionPolicy = 'single' | 'multiple';

export type HighlightSelectionOptions = {
  policy?: HighlightSelectionPolicy;
  replaceScope?: 'all' | 'source';
  maxEntries?: number;
};

export type HighlightLngLat = [number, number];

export type HighlightEntry = {
  id: string | number;
  feature: HighlightGeoJson;
  dataset?: IDataset;
  source?: HighlightSource;
  style: HighlightStyle;
  data: HighlightDataSource;
  /** Pointer lng/lat when show was triggered (click/hover). */
  pointerLngLat?: HighlightLngLat;
  /** Screen point of the pointer event, when available. */
  pointerPoint?: { x: number; y: number };
  /** Originating pointer event type (`click`, `mousemove`, …). */
  pointerEventType?: string;
};

/**
 * Pointer / map interaction snapshot passed to `popup.position` resolvers.
 */
export type HighlightPointerEvent = {
  lngLat: HighlightLngLat;
  point?: { x: number; y: number };
  type?: string;
};

/**
 * Resolve popup location from highlighted feature + pointer event.
 * Return `[lng, lat]` or `undefined` to fall back to feature geometry.
 */
export type HighlightPopupPositionFn = (
  feature: Feature,
  event: HighlightPointerEvent | undefined,
  ctx: { map: MapSimple; entry: HighlightEntry },
) => HighlightLngLat | undefined;

/** Where to place the MapLibre popup. Default: `pointer`. */
export type HighlightPopupPosition =
  'pointer' | 'feature' | HighlightLngLat | HighlightPopupPositionFn;

export type HighlightClickAction = 'popup' | 'detail' | 'none';

export type HighlightPresentation = {
  popup?:
    | boolean
    | {
        kind?: 'maplibre' | 'none';
        content?: string | ((entry: HighlightEntry) => string | HTMLElement);
        offset?: number;
        /**
         * Popup anchor. Default `pointer` (click/hover lngLat).
         * Use a function `(feature, event, ctx) => [lng, lat]` to derive
         * location from data / click. Falls back to `feature` when unresolved.
         */
        position?: HighlightPopupPosition;
      };
  /**
   * What a **map click** pick should do beyond paint.
   * Hover always paints only (no popup / detail).
   * Default: `'popup'`.
   */
  clickAction?: HighlightClickAction;
  onShow?: (
    entry: HighlightEntry,
    ctx: {
      map: MapSimple;
      pointerLngLat?: HighlightLngLat;
      pointerEvent?: HighlightPointerEvent;
    },
  ) => void | (() => void);
  onHide?: (entry: HighlightEntry) => void;
};

export type HighlightShowOptions = {
  dataset?: IDataset;
  source?: HighlightSource;
  style?: HighlightStyle;
  data?: HighlightDataSource;
  selection?: HighlightSelectionOptions;
  presentation?: HighlightPresentation;
  /** Map coordinates of the pointer when show was triggered. */
  pointerLngLat?: HighlightLngLat;
  pointerPoint?: { x: number; y: number };
  pointerEventType?: string;
  onError?: (err: unknown, ctx: { mapId: string }) => void;
};

export type HighlightPartOptions = {
  style?: HighlightStyle;
  /** Flat style fields also accepted for brevity */
  mode?: HighlightMode;
  color?: string;
  durationMs?: number;
  data?: HighlightDataSource;
  selection?: HighlightSelectionOptions;
  presentation?: HighlightPresentation;
  /**
   * Which map pointer events may pick this dataset.
   * Default: `{ click: true, hover: true }`. Does not affect `show()` / menu / AT.
   */
  pointer?: HighlightPointerPolicy;
  filterCreator?: HighlightFilterCreator;
  stateKey?: string;
  animate?: HighlightAnimateFn;
  createDefaultState?: () => Record<string, unknown>;
  paint?: HighlightStyle['paint'];
};

/** Per-part policy for map click / hover pick. */
export type HighlightPointerPolicy = {
  click?: boolean;
  hover?: boolean;
};

export type HighlightPickOptions = {
  source?: 'pointer' | 'hover';
  style?: HighlightStyle;
  styleForDataset?: (dataset: IDataset) => HighlightStyle | undefined;
  data?: HighlightDataSource;
  selection?: HighlightSelectionOptions;
  presentation?: HighlightPresentation;
  pointerLngLat?: HighlightLngLat;
  pointerPoint?: { x: number; y: number };
  pointerEventType?: string;
};

export type HighlightBindPointerOptions = {
  click?: boolean;
  hover?: boolean;
  style?: HighlightStyle;
  styleForDataset?: (dataset: IDataset) => HighlightStyle | undefined;
};

export type HighlightPointOrBox = PointLike | [PointLike, PointLike];
