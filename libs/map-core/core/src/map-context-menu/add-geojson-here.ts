import { mdiRadiusOutline } from '@mdi/js';
import { circle } from '@turf/turf';
import type { Feature, GeoJSON, Polygon } from 'geojson';
import { methodRegistry } from '../registry';
import type { Color } from '../types';
import { formatMapContextCoords } from './actions';
import { createMapMenuBuilder } from './builder';
import type { MapContextMenuItem, MapMenuItemProps } from './types';
import { MAP_CONTEXT_MENU_ID } from './types';

export type MapAddGeojsonHereLayerType = 'point' | 'line' | 'area' | 'symbol';

export type AddGeojsonHerePayload = {
  name: string;
  geojson: GeoJSON;
  type?: MapAddGeojsonHereLayerType;
  opacity?: number;
  color?: Color;
};

export type MapAddGeojsonHereDef = {
  id: string;
  name: string;
  icon?: string;
  geojson: GeoJSON | ((props: MapMenuItemProps) => GeoJSON | Promise<GeoJSON>);
  layerName?: string | ((props: MapMenuItemProps, geojson: GeoJSON) => string);
  type?: MapAddGeojsonHereLayerType;
  opacity?: number;
  color?: Color;
};

const itemsByMap = new Map<string, Map<string, MapAddGeojsonHereDef>>();

export function setAddGeojsonHereItems(
  mapId: string,
  defs: MapAddGeojsonHereDef[],
) {
  const store = new Map<string, MapAddGeojsonHereDef>();
  for (const def of defs) {
    store.set(def.id, def);
  }
  itemsByMap.set(mapId, store);
}

export function clearAddGeojsonHereItems(mapId: string) {
  itemsByMap.delete(mapId);
}

function listAddGeojsonHereItems(mapId: string): MapAddGeojsonHereDef[] {
  return [...(itemsByMap.get(mapId)?.values() ?? [])];
}

function addGeojsonHere(
  props: MapMenuItemProps,
  payload: AddGeojsonHerePayload,
) {
  const handler = methodRegistry.getMenuHandler(
    MAP_CONTEXT_MENU_ID.addGeojsonHere,
    props.mapId,
  );
  if (handler) {
    void handler(props, payload);
  }
}

function formatBufferDistance(meters: number): string {
  if (meters >= 1000 && meters % 1000 === 0) {
    return `${meters / 1000} km`;
  }
  if (meters >= 1000) {
    const km = meters / 1000;
    return `${parseFloat(km.toFixed(2))} km`;
  }
  return `${meters} m`;
}

function createBufferCircleGeojson(
  lng: number,
  lat: number,
  meters: number,
): Feature<Polygon> {
  return circle([lng, lat], meters / 1000, {
    units: 'kilometers',
    steps: 64,
    properties: {
      radius_m: meters,
      center: formatMapContextCoords(lng, lat),
    },
  });
}

export function createAddGeojsonHereDef(
  def: MapAddGeojsonHereDef,
): MapAddGeojsonHereDef {
  return {
    ...def,
    opacity: def.opacity ?? 1,
  };
}

export function createBufferHereDef(
  meters: number,
  options?: Partial<
    Pick<MapAddGeojsonHereDef, 'id' | 'name' | 'icon' | 'opacity' | 'color'>
  >,
): MapAddGeojsonHereDef {
  const distance = formatBufferDistance(meters);
  return createAddGeojsonHereDef({
    id: options?.id ?? `buffer-${meters}m`,
    name: options?.name ?? `Buffer ${distance} here`,
    icon: options?.icon ?? mdiRadiusOutline,
    type: 'area',
    ...(options?.opacity != null ? { opacity: options.opacity } : {}),
    ...(options?.color != null ? { color: options.color } : {}),
    geojson: (props) => {
      const { lng, lat } = props.layer.lngLat;
      return createBufferCircleGeojson(lng, lat, meters);
    },
    layerName: (props) => {
      const { lng, lat } = props.layer.lngLat;
      return `Buffer ${distance} (${formatMapContextCoords(lng, lat)})`;
    },
  });
}

export function getDefaultAddGeojsonHereItems(): MapAddGeojsonHereDef[] {
  return [
    createBufferHereDef(500),
    createBufferHereDef(1000),
    createBufferHereDef(5000),
  ];
}

function createMenuItemAddGeojsonHere(def: MapAddGeojsonHereDef) {
  return createMapMenuBuilder()
    .item()
    .setId(def.id)
    .setName(def.name)
    .setIcon(def.icon ?? mdiRadiusOutline)
    .setClick(async (props) => {
      const geojson =
        typeof def.geojson === 'function'
          ? await def.geojson(props)
          : def.geojson;
      const name =
        typeof def.layerName === 'function'
          ? def.layerName(props, geojson)
          : (def.layerName ?? def.name);
      addGeojsonHere(props, {
        name,
        geojson,
        type: def.type,
        opacity: def.opacity,
        color: def.color,
      });
    })
    .build();
}

export function createMenuItemsAddGeojsonHere(
  mapId?: string,
): MapContextMenuItem[] {
  if (
    !mapId ||
    !methodRegistry.hasMenuHandler(MAP_CONTEXT_MENU_ID.addGeojsonHere, mapId)
  ) {
    return [];
  }
  return listAddGeojsonHereItems(mapId).map(createMenuItemAddGeojsonHere);
}
