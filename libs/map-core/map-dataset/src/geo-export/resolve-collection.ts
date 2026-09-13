import type { FeatureCollection } from 'geojson';
import type { AttributeTableSortState } from '../attribute-table/sort';
import { toFeatureCollection } from '../data-management/normalize';
import type { DataManagementPart } from '../data-management/types';
import type { IDataset } from '../interfaces';
import { findSiblingOrNearestLeaf } from '../model/visitors';
import { isDataManagementView } from '../utils/check';
import { getGeoExportActiveSource } from './active-source';
import { getDatasetFeatureCollection } from './dataset';
import type { ExportGeoGetCollection, GeoExportScope } from './options';
import { recordsToFeatureCollection } from './types';

export type ResolveExportCollectionInput = {
  layer: IDataset;
  mapId?: string;
  scope: GeoExportScope;
  /** Override ids (selected scope). */
  ids?: string[];
  search?: string;
  sort?: AttributeTableSortState[];
  getCollection?: ExportGeoGetCollection;
};

async function listFromDataManagement(
  part: DataManagementPart,
  input: {
    scope: GeoExportScope;
    ids: string[];
    search: string;
    sort: AttributeTableSortState[];
  },
): Promise<FeatureCollection | null> {
  if (input.scope === 'selected') {
    if (!input.ids.length) return { type: 'FeatureCollection', features: [] };
    const result = await part.list({
      page: 1,
      pageSize: 'all',
      filter: { ids: input.ids },
    });
    return (
      toFeatureCollection(result.items ?? []) ??
      recordsToFeatureCollection(result.items ?? [])
    );
  }

  if (input.scope === 'filtered') {
    const primary = input.sort[0];
    const result = await part.list({
      page: 1,
      pageSize: 'all',
      search: input.search || undefined,
      sort: primary
        ? { field: primary.key, dir: primary.dir }
        : undefined,
    });
    return (
      toFeatureCollection(result.items ?? []) ??
      recordsToFeatureCollection(result.items ?? [])
    );
  }

  const result = await part.list({ pageSize: 'all' });
  return (
    toFeatureCollection(result.items ?? []) ??
    recordsToFeatureCollection(result.items ?? [])
  );
}

/**
 * Resolve export FeatureCollection.
 * Precedence: `getCollection` → active AT bridge → data-management → GeoJSON source.
 */
export async function resolveExportCollection(
  input: ResolveExportCollectionInput,
): Promise<FeatureCollection | null> {
  const { layer, mapId, scope, getCollection } = input;

  if (getCollection) {
    const custom = await getCollection(layer);
    return custom ?? null;
  }

  const active = getGeoExportActiveSource(mapId, layer);
  const search = input.search ?? active?.getSearch() ?? '';
  const sort = input.sort ?? active?.getSort() ?? [];
  const ids = (input.ids ?? active?.getSelectedIds() ?? []).map(String);

  if (active) {
    if (scope === 'selected') {
      return active.resolveSelectedCollection(ids);
    }
    if (scope === 'filtered') {
      return active.resolveFilteredCollection();
    }
    // all — prefer DM/source full dump below (ignore AT page window)
  }

  const management = findSiblingOrNearestLeaf(layer, isDataManagementView);
  if (management && isDataManagementView(management)) {
    return listFromDataManagement(management, { scope, ids, search, sort });
  }

  return getDatasetFeatureCollection(layer);
}
