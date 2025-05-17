import type { MapSimple } from '@hungpvq/shared-map';
import {
  BaseMapItem,
  BaseMapRasterItem,
  BaseMapVectorItem,
  IBaseMapLayer,
} from '../types';
type LoaderReturn = {
  layers: any[];
  sources: any;
};
export const BASEMAP_PREFIX = 'base_map_control_';
export class BaseMapLayer implements IBaseMapLayer {
  protected layers: any[];
  protected sources: any;
  protected _baseMap?: BaseMapItem = undefined;
  constructor() {
    this.layers = [];
    this.sources = {};
  }
  getBeforeId() {
    return this.layers[0].id;
  }
  async setBaseMap(baseMap: BaseMapItem) {
    if (this._baseMap && this._baseMap.id === baseMap.id) {
      return;
    }
    this._baseMap = baseMap;
    const { sources, layers } = await getLoader(baseMap.type)(baseMap);
    this.layers = layers;
    this.sources = sources;
  }
  addToMap(map: MapSimple, beforeId?: string) {
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
        map.addLayer(layer, beforeId);
      }
    });
  }
  removeFromMap(map: MapSimple) {
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

async function loadNoBaseMap(): Promise<LoaderReturn> {
  return { layers: [], sources: {} };
}
async function loadVector(item: BaseMapVectorItem) {
  const res = await fetch(item.links[0]).then((res) => res.json());

  const layers = [];
  const sources: any = {};
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
      Object.assign(layer, {
        id: layerId,
        source: sourceId,
        metadata: {
          ...layer.metadata,
          'maplibregl-legend:disable': true,
        },
      })
    );
  }
  const glyphs = res.glyphs;
  const sprite = res.sprite;
  return { layers, sources, glyphs, sprite };
}
async function loadRaster(item: BaseMapRasterItem): Promise<LoaderReturn> {
  if (!item) throw new Error('Not found item');

  const layerId = `${BASEMAP_PREFIX}layer`;
  const sourceId = `${BASEMAP_PREFIX}source`;
  const sources: any = {};
  sources[sourceId] = {
    type: 'raster',
    tiles: item.links,
    scheme: item.scheme || 'xyz',
    maxzoom: item.maxzoom || 22,
    minzoom: item.minzoom || 0,
    tileSize: item.tileSize || 256,
  };
  const layer = {
    id: layerId,
    type: 'raster',
    source: sourceId,
    metadata: {
      'maplibregl-legend:disable': true,
    },
  };

  return { layers: [layer], sources };
}
