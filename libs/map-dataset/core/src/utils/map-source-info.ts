import type { IFieldInfo } from '../interfaces/dataset.parts';

const TILE_SOURCE_BASE_FIELDS = [
  { trans: 'map.layer-control.field.name', value: 'name' },
  { trans: 'map.layer-control.field.type', value: 'type' },
  { trans: 'map.layer-control.field.source-id', value: 'sourceId' },
  { trans: 'map.layer-control.field.bound.title', value: 'bbox' },
  { trans: 'map.layer-control.field.url', value: 'url', inline: true },
  { trans: 'map.layer-control.field.tiles', value: 'tiles', inline: true },
] as const satisfies readonly IFieldInfo[];

const TILE_SOURCE_TAIL_FIELDS = [
  { trans: 'map.layer-control.field.minzoom', value: 'minzoom' },
  { trans: 'map.layer-control.field.maxzoom', value: 'maxzoom' },
  { trans: 'map.layer-control.field.scheme', value: 'scheme' },
  { trans: 'map.layer-control.field.attribution', value: 'attribution' },
] as const satisfies readonly IFieldInfo[];

const TILE_SIZE_FIELD = {
  trans: 'map.layer-control.field.tile-size',
  value: 'tileSize',
} as const satisfies IFieldInfo;

export type TileSourceInfoSpec = {
  type: string;
  bounds?: unknown;
  url?: string;
  tiles?: string[];
  tileSize?: number;
  minzoom?: number;
  maxzoom?: number;
  scheme?: string;
  attribution?: string;
};

export function getTileSourceFieldsInfo(options?: {
  includeTileSize?: boolean;
}): IFieldInfo[] {
  const fields: IFieldInfo[] = [...TILE_SOURCE_BASE_FIELDS];
  if (options?.includeTileSize) {
    fields.push(TILE_SIZE_FIELD);
  }
  fields.push(...TILE_SOURCE_TAIL_FIELDS);
  return fields;
}

export function buildTileSourceDataInfo(
  name: string,
  sourceId: string,
  bbox: unknown,
  spec: TileSourceInfoSpec,
  options?: { includeTileSize?: boolean },
): Record<string, unknown> {
  const info: Record<string, unknown> = {
    name,
    type: spec.type,
    sourceId,
    bbox: bbox || spec.bounds,
    url: spec.url,
    tiles: spec.tiles?.join('\n'),
    minzoom: spec.minzoom,
    maxzoom: spec.maxzoom,
    scheme: spec.scheme,
    attribution: spec.attribution,
  };
  if (options?.includeTileSize) {
    info['tileSize'] = spec.tileSize;
  }
  return info;
}
