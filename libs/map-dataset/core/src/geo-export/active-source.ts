import type { FeatureCollection } from 'geojson';

import type { AttributeTableSortState } from '../attribute-table/sort';
import type { IDataset } from '../interfaces/dataset.base';

/** Snapshot / helpers registered while Attribute Table is open for a map+layer. */
export type GeoExportActiveSource = {
  layerId: string;
  getSearch: () => string;
  getSort: () => AttributeTableSortState[];
  getSelectedIds: () => string[];
  /** Resolve selected (or given) rows → FeatureCollection. */
  resolveSelectedCollection: (
    ids?: string[],
  ) => Promise<FeatureCollection | null>;
  /** Full filtered set (search/sort) as FeatureCollection. */
  resolveFilteredCollection: () => Promise<FeatureCollection | null>;
};

const byMap = new Map<string, GeoExportActiveSource>();

function key(mapId: string, layerId: string): string {
  return `${mapId}::${layerId}`;
}

/** Register AT export bridge when Attribute Table mounts. */
export function setGeoExportActiveSource(
  mapId: string,
  source: GeoExportActiveSource,
): void {
  byMap.set(key(mapId, source.layerId), source);
}

/** Clear bridge when Attribute Table unmounts (or layer changes). */
export function clearGeoExportActiveSource(
  mapId: string,
  layerId?: string,
): void {
  if (layerId) {
    byMap.delete(key(mapId, layerId));
    return;
  }
  for (const k of [...byMap.keys()]) {
    if (k.startsWith(`${mapId}::`)) byMap.delete(k);
  }
}

export function getGeoExportActiveSource(
  mapId: string | undefined,
  layer: IDataset,
): GeoExportActiveSource | undefined {
  if (!mapId) return undefined;
  return byMap.get(key(mapId, layer.id));
}
