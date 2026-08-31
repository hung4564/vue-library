/**
 * Framework-agnostic basemap layer implementation
 */

import type {
  BaseMapItem,
  BaseMapRasterItem,
  BaseMapVectorItem,
  IBaseMapLayer,
  MapSimple,
} from '../../types';
import { LayerSpecification, SourceSpecification } from 'maplibre-gl';

type LoaderReturn = {
  layers: LayerSpecification[];
  sources: Record<string, SourceSpecification>;
  glyphs?: string;
  sprite?: string;
};

export const BASEMAP_PREFIX = 'base_map_control_';

/**
 * Default implementation of IBaseMapLayer
 * Handles loading and managing basemap layers on the map
 */
export class BaseMapLayer implements IBaseMapLayer {
  protected layers: LayerSpecification[];
  protected sources: Record<string, SourceSpecification>;
  protected _baseMap?: BaseMapItem = undefined;

  constructor() {
    this.layers = [];
    this.sources = {};
  }

  /**
   * Get the ID of the first layer (used for positioning)
   */
  getBeforeId(): string | undefined {
    return this.layers[0]?.id;
  }

  /**
   * Set the basemap for this layer
   *
   * @param baseMap - The basemap item to set
   */
  async setBaseMap(baseMap: BaseMapItem): Promise<void> {
    // Always reload after removeFromMap — early-return by id left empty layers on map
    this._baseMap = baseMap;
    const { sources, layers } = await getLoader(baseMap.type)(baseMap);
    this.layers = layers;
    this.sources = sources;
  }

  /**
   * Add the layer to the map
   *
   * @param map - The map instance
   * @param beforeId - Optional layer ID to insert before
   */
  addToMap(map: MapSimple, beforeId?: string): void {
    for (const source_id in this.sources) {
      if (Object.hasOwnProperty.call(this.sources, source_id)) {
        const source = this.sources[source_id];
        if (!map.getSource(source_id)) {
          map.addSource(source_id, source);
        }
      }
    }
    this.layers.forEach((layer) => {
      if (!map.getLayer(layer.id)) {
        map.addLayer(layer as any, beforeId);
      }
    });
  }

  /**
   * Remove the layer from the map
   *
   * @param map - The map instance
   */
  removeFromMap(map: MapSimple): void {
    this.layers.forEach((layer) => {
      if (map.getLayer(layer.id)) {
        map.removeLayer(layer.id);
      }
    });
    for (const source_id in this.sources) {
      if (map.getSource(source_id)) {
        map.removeSource(source_id);
      }
    }
  }
}

/**
 * Get the appropriate loader function based on basemap type
 */
function getLoader(type: string): (basemap: any) => Promise<LoaderReturn> {
  switch (type) {
    case 'vector':
      return loadVector;
    case 'raster':
      return loadRaster;
    case 'no-basemap':
      return loadNoBaseMap;
    default:
      throw new Error(`Not support ${type}`);
  }
}

/**
 * Load no basemap (empty layers and sources)
 */
async function loadNoBaseMap(): Promise<LoaderReturn> {
  return { layers: [], sources: {} };
}

/**
 * Load vector basemap from style JSON
 *
 * @param item - Vector basemap item
 * @returns Layers and sources for the vector basemap
 */
async function loadVector(item: BaseMapVectorItem): Promise<LoaderReturn> {
  const res = await fetch(item.links[0]).then((res) => res.json());

  const layers: LayerSpecification[] = [];
  const sources: Record<string, SourceSpecification> = {};

  // Add sources
  for (const id in res.sources) {
    const sourceId = BASEMAP_PREFIX + id;
    sources[sourceId] = res.sources[id];
  }

  // Add layers
  for (const layer of res.layers) {
    const layerId = BASEMAP_PREFIX + layer.id;
    const sourceId = BASEMAP_PREFIX + layer.source;

    layers.push(
      Object.assign({}, layer, {
        id: layerId,
        source: sourceId,
        metadata: {
          ...layer.metadata,
          'maplibregl-legend:disable': true,
        },
      }) as LayerSpecification,
    );
  }

  const glyphs = res.glyphs;
  const sprite = res.sprite;
  return { layers, sources, glyphs, sprite };
}

/**
 * Load raster basemap
 *
 * @param item - Raster basemap item
 * @returns Layers and sources for the raster basemap
 */
async function loadRaster(item: BaseMapRasterItem): Promise<LoaderReturn> {
  if (!item) throw new Error('Not found item');

  const layerId = `${BASEMAP_PREFIX}layer`;
  const sourceId = `${BASEMAP_PREFIX}source`;
  const sources: Record<string, SourceSpecification> = {};

  sources[sourceId] = {
    type: 'raster',
    tiles: item.links,
    scheme: (item.scheme as any) || 'xyz',
    maxzoom: item.maxzoom || 22,
    minzoom: item.minzoom || 0,
    tileSize: item.tileSize || 256,
  };

  const layer: LayerSpecification = {
    id: layerId,
    type: 'raster',
    source: sourceId,
    metadata: {
      'maplibregl-legend:disable': true,
    },
  };

  return { layers: [layer], sources };
}
