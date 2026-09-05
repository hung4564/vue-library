import type { MapSimple } from '@hungpvq/map-core';
import type {
  GeoJSONSource,
  GeoJSONSourceSpecification,
  RasterSourceSpecification,
  VectorSourceSpecification,
} from 'maplibre-gl';
import type { IMapboxSourceView, IMetadataView } from '../../interfaces';
import { createNamedComponent } from '../base';
import { findSiblingOrNearestLeaf } from '../visitors';
import { createDatasetPartMapboxSourceComponent } from './base';

export function createDatasetPartGeojsonSourceComponent(
  name: string,
  data?: GeoJSONSourceSpecification['data'],
  options?: Pick<GeoJSONSourceSpecification, 'promoteId' | 'generateId'>,
): IMapboxSourceView {
  const base = createDatasetPartMapboxSourceComponent<
    GeoJSONSourceSpecification['data'] | undefined
  >(name, data);

  return createNamedComponent('GeojsonSourceComponent', {
    ...base,
    getMapboxSource: () => ({
      type: 'geojson' as const,
      data: base.getData() || {
        type: 'FeatureCollection',
        features: [],
      },
      ...(options?.promoteId != null ? { promoteId: options.promoteId } : {}),
      ...(options?.generateId ? { generateId: true } : {}),
    }),
    getFieldsInfo() {
      return [
        { trans: 'map.layer-control.field.name', value: 'name' },
        { trans: 'map.layer-control.field.type', value: 'type' },
        { trans: 'map.layer-control.field.source-id', value: 'sourceId' },
        { trans: 'map.layer-control.field.bound.title', value: 'bbox' },
        { trans: 'map.layer-control.field.features', value: 'features' },
        { trans: 'map.layer-control.field.geometry', value: 'geometry' },
        { trans: 'map.layer-control.field.promote-id', value: 'promoteId' },
        { trans: 'map.layer-control.field.generate-id', value: 'generateId' },
        {
          trans: 'map.layer-control.field.geojson',
          value: 'geojson',
          inline: true,
        },
      ];
    },
    getDataInfo() {
      const metadata = findSiblingOrNearestLeaf(
        base,
        (d) => d.type === 'metadata',
      ) as IMetadataView;
      const spec = this.getMapboxSource();
      const data = base.getData();
      const stats = getGeojsonStats(data);

      return {
        name: base.getName(),
        type: spec.type,
        sourceId: this.getSourceId(),
        bbox: metadata?.metadata?.bbox,
        features: stats.featureCount,
        geometry: stats.geometryTypes,
        promoteId: spec.promoteId,
        generateId: spec.generateId,
        geojson:
          typeof data === 'string'
            ? data
            : JSON.stringify(data ?? {}, undefined, 2),
      };
    },
    updateData(
      map: MapSimple,
      data:
        | GeoJSON.Feature<GeoJSON.Geometry>
        | GeoJSON.FeatureCollection<GeoJSON.Geometry>
        | string,
    ) {
      const source = map.getSource(base.id) as GeoJSONSource;
      if (source) {
        source.setData(data);
      }
      base.setData(data);
    },
  });
}
export function createDatasetPartRasterSourceComponent(
  name: string,
  data: RasterSourceSpecification,
): IMapboxSourceView {
  const base =
    createDatasetPartMapboxSourceComponent<RasterSourceSpecification>(
      name,
      data,
    );

  return createNamedComponent('RasterSourceComponent', {
    ...base,
    getMapboxSource: () => base.getData(),
    getFieldsInfo() {
      return [
        { trans: 'map.layer-control.field.name', value: 'name' },
        { trans: 'map.layer-control.field.type', value: 'type' },
        { trans: 'map.layer-control.field.source-id', value: 'sourceId' },
        { trans: 'map.layer-control.field.bound.title', value: 'bbox' },
        { trans: 'map.layer-control.field.url', value: 'url', inline: true },
        { trans: 'map.layer-control.field.tiles', value: 'tiles', inline: true },
        { trans: 'map.layer-control.field.tile-size', value: 'tileSize' },
        { trans: 'map.layer-control.field.minzoom', value: 'minzoom' },
        { trans: 'map.layer-control.field.maxzoom', value: 'maxzoom' },
        { trans: 'map.layer-control.field.scheme', value: 'scheme' },
        { trans: 'map.layer-control.field.attribution', value: 'attribution' },
      ];
    },
    getDataInfo() {
      const metadata = findSiblingOrNearestLeaf(
        base,
        (d) => d.type === 'metadata',
      ) as IMetadataView;
      const raster = this.getMapboxSource();
      return {
        name: base.getName(),
        type: raster.type,
        sourceId: this.getSourceId(),
        bbox: metadata?.metadata?.bbox || raster.bounds,
        url: raster.url,
        tiles: raster.tiles?.join('\n'),
        tileSize: raster.tileSize,
        minzoom: raster.minzoom,
        maxzoom: raster.maxzoom,
        scheme: raster.scheme,
        attribution: raster.attribution,
      };
    },
  });
}

export function createDatasetPartVectorTileComponent(
  name: string,
  data?: Partial<VectorSourceSpecification>,
): IMapboxSourceView {
  const base = createDatasetPartMapboxSourceComponent<
    Partial<VectorSourceSpecification> | undefined
  >(name, data);
  return createNamedComponent('GeojsonSourceComponent', {
    ...base,
    getMapboxSource: () => ({
      type: 'vector',
      ...base.getData(),
    }),

    getFieldsInfo() {
      return [
        { trans: 'map.layer-control.field.name', value: 'name' },
        { trans: 'map.layer-control.field.type', value: 'type' },
        { trans: 'map.layer-control.field.source-id', value: 'sourceId' },
        { trans: 'map.layer-control.field.bound.title', value: 'bbox' },
        { trans: 'map.layer-control.field.url', value: 'url', inline: true },
        { trans: 'map.layer-control.field.tiles', value: 'tiles', inline: true },
        { trans: 'map.layer-control.field.minzoom', value: 'minzoom' },
        { trans: 'map.layer-control.field.maxzoom', value: 'maxzoom' },
        { trans: 'map.layer-control.field.scheme', value: 'scheme' },
        { trans: 'map.layer-control.field.attribution', value: 'attribution' },
      ];
    },
    getDataInfo() {
      const metadata = findSiblingOrNearestLeaf(
        base,
        (d) => d.type === 'metadata',
      ) as IMetadataView;
      const spec = this.getMapboxSource();
      return {
        name: base.getName(),
        type: spec.type,
        sourceId: this.getSourceId(),
        bbox: metadata?.metadata?.bbox || spec.bounds,
        url: spec.url,
        tiles: spec.tiles?.join('\n'),
        minzoom: spec.minzoom,
        maxzoom: spec.maxzoom,
        scheme: spec.scheme,
        attribution: spec.attribution,
      };
    },
  });
}

function getGeojsonStats(data: unknown): {
  featureCount?: number;
  geometryTypes?: string;
} {
  if (!data || typeof data === 'string') return {};
  if (typeof data !== 'object') return {};

  const types = new Set<string>();
  const record = data as {
    type?: string;
    features?: unknown[];
    geometry?: { type?: string };
  };

  if (record.type === 'FeatureCollection' && Array.isArray(record.features)) {
    for (const feature of record.features) {
      const geometryType = (feature as { geometry?: { type?: string } })
        ?.geometry?.type;
      if (geometryType) types.add(geometryType);
    }
    return {
      featureCount: record.features.length,
      geometryTypes: [...types].join(', ') || undefined,
    };
  }

  if (record.type === 'Feature') {
    const geometryType = record.geometry?.type;
    if (geometryType) types.add(geometryType);
    return {
      featureCount: 1,
      geometryTypes: [...types].join(', ') || undefined,
    };
  }

  if (record.type) {
    return { featureCount: 1, geometryTypes: record.type };
  }
  return {};
}

