/**
 * Framework-agnostic basemap layer (raster / vector / none).
 */

import { LayerSpecification, SourceSpecification } from 'maplibre-gl';

import type { MapSimple } from '../../types';
import type {
  BaseMapItem,
  BaseMapRasterItem,
  BaseMapVectorItem,
  IBaseMapLayer,
} from '../types';

type LoaderReturn = {
  layers: LayerSpecification[];
  sources: Record<string, SourceSpecification>;
  glyphs?: string;
  sprite?: string;
};

type MapWithStyleMutators = MapSimple & {
  setGlyphs?: (glyphs: string) => void;
  setSprite?: (sprite: string) => void;
};

export const BASEMAP_PREFIX = 'base_map_control_';

export class BaseMapLayer implements IBaseMapLayer {
  protected layers: LayerSpecification[] = [];
  protected sources: Record<string, SourceSpecification> = {};
  protected glyphs?: string;
  protected sprite?: string;

  getBeforeId(): string | undefined {
    return this.layers[0]?.id;
  }

  async setBaseMap(baseMap: BaseMapItem): Promise<void> {
    const { sources, layers, glyphs, sprite } = await getLoader(baseMap.type)(
      baseMap,
    );
    this.layers = layers;
    this.sources = sources;
    this.glyphs = glyphs;
    this.sprite = sprite;
  }

  addToMap(map: MapSimple, beforeId?: string): void {
    this.applyStyleAssets(map);

    for (const sourceId of Object.keys(this.sources)) {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, this.sources[sourceId]);
      }
    }
    for (const layer of this.layers) {
      if (!map.getLayer(layer.id)) {
        map.addLayer(layer as any, beforeId);
      }
    }
  }

  removeFromMap(map: MapSimple): void {
    for (const layer of this.layers) {
      if (map.getLayer(layer.id)) {
        map.removeLayer(layer.id);
      }
    }
    for (const sourceId of Object.keys(this.sources)) {
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    }
  }

  setOpacity(map: MapSimple, opacity: number): void {
    const value = clampOpacity(opacity);
    for (const layer of this.layers) {
      if (!map.getLayer(layer.id)) continue;
      for (const key of getBasemapOpacityPaintKeys(layer.type)) {
        map.setPaintProperty(layer.id, key, value);
      }
    }
  }

  /** Apply vector glyphs/sprite without full setStyle (keeps overlays). */
  protected applyStyleAssets(map: MapSimple): void {
    const m = map as MapWithStyleMutators;
    if (this.glyphs) {
      if (typeof m.setGlyphs === 'function') {
        m.setGlyphs(this.glyphs);
      } else {
        const style = map.getStyle();
        if (style) (style as { glyphs?: string }).glyphs = this.glyphs;
      }
    }
    if (this.sprite) {
      if (typeof m.setSprite === 'function') {
        m.setSprite(this.sprite);
      } else {
        const style = map.getStyle();
        if (style) (style as { sprite?: string }).sprite = this.sprite;
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

async function loadVector(item: BaseMapVectorItem): Promise<LoaderReturn> {
  const res = await fetch(item.links[0]).then((r) => r.json());
  const layers: LayerSpecification[] = [];
  const sources: Record<string, SourceSpecification> = {};

  for (const id in res.sources) {
    sources[BASEMAP_PREFIX + id] = res.sources[id];
  }
  for (const layer of res.layers) {
    layers.push(
      Object.assign({}, layer, {
        id: BASEMAP_PREFIX + layer.id,
        source: BASEMAP_PREFIX + layer.source,
        metadata: {
          ...layer.metadata,
          'maplibregl-legend:disable': true,
        },
      }) as LayerSpecification,
    );
  }

  return {
    layers,
    sources,
    glyphs: res.glyphs,
    sprite: typeof res.sprite === 'string' ? res.sprite : undefined,
  };
}

/** Paint keys used to dim a MapLibre style layer by type. */
export function getBasemapOpacityPaintKeys(layerType: string): string[] {
  switch (layerType) {
    case 'symbol':
      return ['icon-opacity', 'text-opacity'];
    case 'raster':
    case 'fill':
    case 'line':
    case 'circle':
    case 'heatmap':
    case 'fill-extrusion':
    case 'background':
      return [`${layerType}-opacity`];
    default:
      return [];
  }
}

function clampOpacity(opacity: number): number {
  if (!Number.isFinite(opacity)) return 1;
  return Math.min(1, Math.max(0, opacity));
}

async function loadRaster(item: BaseMapRasterItem): Promise<LoaderReturn> {
  if (!item) throw new Error('Not found item');

  const layerId = `${BASEMAP_PREFIX}layer`;
  const sourceId = `${BASEMAP_PREFIX}source`;

  return {
    sources: {
      [sourceId]: {
        type: 'raster',
        tiles: item.links,
        scheme: (item.scheme as any) || 'xyz',
        maxzoom: item.maxzoom || 22,
        minzoom: item.minzoom || 0,
        tileSize: item.tileSize || 256,
      },
    },
    layers: [
      {
        id: layerId,
        type: 'raster',
        source: sourceId,
        metadata: { 'maplibregl-legend:disable': true },
      },
    ],
  };
}
