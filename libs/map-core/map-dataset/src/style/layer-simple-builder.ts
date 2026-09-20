import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  FilterSpecification,
  LayerSpecification as LayerMapbox,
  LineLayerSpecification,
  RasterLayerSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';

import type { Color } from '@hungpvq/map-core';
import { getChartRandomColor } from '@hungpvq/map-core';

export interface ILayerMapboxBuild {
  build(): Omit<LayerMapbox, 'id' | 'source'>;
}
export class LayerRasterMapboxBuild implements ILayerMapboxBuild {
  build(): Omit<RasterLayerSpecification, 'id' | 'source'> {
    return {
      type: 'raster',
    };
  }
}
export type LayerStyleType = 'point' | 'line' | 'area' | 'symbol';

export class LayerSimpleMapboxBuild implements ILayerMapboxBuild {
  public color?: Color;
  public opacity?: number;
  public type: LayerStyleType = 'point';
  public filter?: FilterSpecification = undefined;
  setColor(color: Color | undefined) {
    this.color = color;
    return this;
  }
  setFilter(filter?: FilterSpecification) {
    this.filter = filter;
    return this;
  }
  setStyleType(type: LayerStyleType) {
    this.type = type;
    return this;
  }
  setOpacity(opacity: number) {
    this.opacity = opacity;
    return this;
  }
  build(): Omit<LayerMapbox, 'id'> {
    return getDefaultLayer({
      type: this.type,
      color: this.color,
      opacity: this.opacity,
      filter: this.filter,
    });
  }
}

export const getDefaultLayer = ({
  type,
  color,
  opacity,
  filter,
}: {
  type: string;
  color?: Color;
  opacity?: number;
  filter?: FilterSpecification;
}): Omit<
  | LineLayerSpecification
  | FillLayerSpecification
  | CircleLayerSpecification
  | SymbolLayerSpecification,
  'id' | 'source'
> => {
  let layer:
    | LineLayerSpecification
    | FillLayerSpecification
    | CircleLayerSpecification
    | SymbolLayerSpecification;
  switch (type) {
    case 'point':
      layer = {
        layout: { visibility: 'visible' },
        type: 'circle',
        paint: {
          'circle-color': color || getChartRandomColor(),
          'circle-radius': 6,
          'circle-opacity': opacity ?? 1,
        },
      } as CircleLayerSpecification;
      break;

    case 'line':
      layer = {
        layout: { visibility: 'visible' },
        type: 'line',
        paint: {
          'line-color': color || getChartRandomColor(),
          'line-width': 4,
          'line-opacity': opacity ?? 1,
        },
      } as LineLayerSpecification;
      break;
    case 'area':
      layer = {
        layout: { visibility: 'visible' },
        type: 'fill',
        paint: {
          'fill-color': color || getChartRandomColor(),
          'fill-opacity': opacity ?? 1,
        },
      } as FillLayerSpecification;
      break;

    case 'symbol':
      layer = {
        layout: { visibility: 'visible' },
        type: 'symbol',
        paint: {},
      } as SymbolLayerSpecification;
      break;

    default:
      throw new Error('Invalid type: ' + type);
  }
  if (filter) {
    layer.filter = filter;
  }
  return layer;
};

export type SimpleStyleLayerSpec = Omit<LayerMapbox, 'id' | 'source'> & {
  'source-layer'?: string;
};

export type BuildSimpleStyleLayersOptions = {
  sourceLayer?: string;
  /** When true, attach geometry-type filters (incl. Multi*). */
  withTypeFilter?: boolean;
};

function styleTypeToMapboxGeometryType(
  style: LayerStyleType,
): 'Point' | 'LineString' | 'Polygon' | undefined {
  if (style === 'point') return 'Point';
  if (style === 'line') return 'LineString';
  if (style === 'area') return 'Polygon';
  return undefined;
}

function attachSourceLayer(
  layer: SimpleStyleLayerSpec,
  sourceLayer: string | undefined,
): SimpleStyleLayerSpec {
  if (!sourceLayer) return layer;
  return { ...layer, 'source-layer': sourceLayer };
}

function typeFilter(
  style: LayerStyleType,
  withTypeFilter: boolean,
): FilterSpecification | undefined {
  if (!withTypeFilter) return undefined;
  const mapboxType = styleTypeToMapboxGeometryType(style);
  if (!mapboxType) return undefined;
  // Prefer geometry-type + Multi* (MapLibre 5); $type alone can miss MultiPolygon.
  if (mapboxType === 'Polygon') {
    return [
      'match',
      ['geometry-type'],
      ['Polygon', 'MultiPolygon'],
      true,
      false,
    ] as FilterSpecification;
  }
  if (mapboxType === 'LineString') {
    return [
      'match',
      ['geometry-type'],
      ['LineString', 'MultiLineString'],
      true,
      false,
    ] as FilterSpecification;
  }
  return [
    'match',
    ['geometry-type'],
    ['Point', 'MultiPoint'],
    true,
    false,
  ] as FilterSpecification;
}

/**
 * Expand a simple style type into MapLibre layer specs.
 * `area` → fill + outline line (QGIS-like regions).
 */
export function buildSimpleStyleLayers(
  style: LayerStyleType,
  color: Color,
  opacity: number | undefined,
  options: BuildSimpleStyleLayersOptions = {},
): SimpleStyleLayerSpec[] {
  const withTypeFilter = options.withTypeFilter === true;
  const sourceLayer = options.sourceLayer;

  if (style === 'area') {
    const fillOpacity = opacity ?? 0.5;
    const fill = new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(color)
      .setOpacity(fillOpacity)
      .setFilter(typeFilter('area', withTypeFilter))
      .build() as Omit<FillLayerSpecification, 'id' | 'source'>;

    const outlineFilter =
      typeFilter('area', true) ??
      ([
        'match',
        ['geometry-type'],
        ['Polygon', 'MultiPolygon'],
        true,
        false,
      ] as FilterSpecification);
    const outline = {
      layout: { visibility: 'visible' as const },
      type: 'line' as const,
      paint: {
        'line-color': color,
        'line-width': 1,
        'line-opacity': opacity ?? 1,
      },
      filter: outlineFilter,
    } satisfies Omit<LineLayerSpecification, 'id' | 'source'>;

    return [
      attachSourceLayer(fill, sourceLayer),
      attachSourceLayer(outline, sourceLayer),
    ];
  }

  const layer = new LayerSimpleMapboxBuild()
    .setStyleType(style)
    .setColor(color)
    .setOpacity(opacity ?? 1)
    .setFilter(typeFilter(style, withTypeFilter))
    .build() as
    | Omit<CircleLayerSpecification, 'id' | 'source'>
    | Omit<LineLayerSpecification, 'id' | 'source'>;

  return [attachSourceLayer(layer, sourceLayer)];
}

/** TileServer-style preview: area(+outline) + line + point for one source-layer. */
export function buildAutoVectorTileStyleLayers(
  color: Color,
  opacity: number | undefined,
  sourceLayer?: string,
): SimpleStyleLayerSpec[] {
  const styles: LayerStyleType[] = ['area', 'line', 'point'];
  return styles.flatMap((style) =>
    buildSimpleStyleLayers(style, color, opacity, {
      sourceLayer,
      withTypeFilter: true,
    }),
  );
}
