import { runMapControlAction } from '@hungpvq/map-core';
import type { Feature, FeatureCollection } from 'geojson';
import { exportFeatureCollectionGeo } from '../geo-export/dataset';
import type { GeoExportFormat } from '../geo-export/types';

export const ATTRIBUTE_TABLE_GEOMETRY_KEY = '__geometry';

/** AttributeTable registry id + select action (must match useRegisterMapControl). */
export const ATTRIBUTE_TABLE_CONTROL = {
  id: 'mapAttributeTable',
  actionSelectRows: 'mapAttributeTable.selectRows',
} as const;

export type AttributeTableSelectRowsPayload = {
  ids: string[];
};

/**
 * Selection requested before AttributeTable control is registered (e.g. identify
 * opens the table via addComponent). Flushed on mount / after selectRows runs.
 */
const pendingSelectRowsByMapId = new Map<string, string[]>();

export function queueAttributeTableSelectRows(
  mapId: string,
  ids: string[],
): void {
  const normalized = ids.map(String);
  pendingSelectRowsByMapId.set(mapId, normalized);
  runMapControlAction(
    mapId,
    ATTRIBUTE_TABLE_CONTROL.id,
    ATTRIBUTE_TABLE_CONTROL.actionSelectRows,
    { ids: normalized } satisfies AttributeTableSelectRowsPayload,
  );
}

/** Peek pending ids (cleared only via clearPending / successful apply). */
export function takePendingAttributeTableSelectRows(
  mapId: string,
): string[] | null {
  return pendingSelectRowsByMapId.get(mapId) ?? null;
}

export function clearPendingAttributeTableSelectRows(mapId: string): void {
  pendingSelectRowsByMapId.delete(mapId);
}

export type AttributeTableColumn = {
  key: string;
  label: string;
};

export type AttributeTableColumnDef = string | { key: string; label?: string };

export type AttributeTableColumnsOption =
  AttributeTableColumnDef[] | Record<string, string>;

export type AttributeTableRow = {
  id: string;
  feature: Feature;
  cells: Record<string, string>;
};

export function formatAttributeCell(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function resolveAttributeTableColumns(
  collection: FeatureCollection,
  option?: AttributeTableColumnsOption,
): AttributeTableColumn[] {
  if (option && !Array.isArray(option)) {
    return Object.entries(option).map(([key, label]) => ({
      key,
      label: label || key,
    }));
  }
  if (Array.isArray(option) && option.length > 0) {
    return option.map((item) =>
      typeof item === 'string'
        ? { key: item, label: item }
        : { key: item.key, label: item.label || item.key },
    );
  }
  const keys = new Set<string>();
  for (const feature of collection.features) {
    const props = feature.properties;
    if (!props || typeof props !== 'object') continue;
    Object.keys(props).forEach((key) => keys.add(key));
  }
  const columns: AttributeTableColumn[] = Array.from(keys)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({ key, label: key }));
  columns.push({ key: ATTRIBUTE_TABLE_GEOMETRY_KEY, label: 'Geometry' });
  return columns;
}

export function buildAttributeTable(
  collection: FeatureCollection,
  columnsOption?: AttributeTableColumnsOption,
): {
  columns: AttributeTableColumn[];
  rows: AttributeTableRow[];
} {
  const columns = resolveAttributeTableColumns(collection, columnsOption);
  const rows: AttributeTableRow[] = collection.features.map(
    (feature, index) => {
      const cells: Record<string, string> = {};
      const props = (feature.properties ?? {}) as Record<string, unknown>;
      for (const column of columns) {
        if (column.key === ATTRIBUTE_TABLE_GEOMETRY_KEY) {
          cells[column.key] = feature.geometry?.type ?? '';
          continue;
        }
        cells[column.key] = formatAttributeCell(props[column.key]);
      }
      const featureId =
        feature.id != null
          ? String(feature.id)
          : props['id'] != null
            ? String(props['id'])
            : '';
      const id = featureId ? `${index}:${featureId}` : String(index);
      return { id, feature, cells };
    },
  );

  return { columns, rows };
}

export function filterAttributeTableRows(
  rows: AttributeTableRow[],
  query: string,
): AttributeTableRow[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((row) =>
    Object.values(row.cells).some((cell) =>
      cell.toLowerCase().includes(needle),
    ),
  );
}

/**
 * Map requested feature ids (from Identify etc.) onto AttributeTable row ids
 * (`index:featureId` or plain index).
 */
export function resolveAttributeTableSelectedRowIds(
  requestedIds: string[],
  rows: AttributeTableRow[],
): string[] {
  if (requestedIds.length === 0) return [];
  const requested = new Set(requestedIds.map(String));
  return rows
    .filter((row) => {
      if (requested.has(row.id)) return true;
      const featureId = row.feature.id != null ? String(row.feature.id) : '';
      const propId =
        row.feature.properties &&
        typeof row.feature.properties === 'object' &&
        (row.feature.properties as Record<string, unknown>)['id'] != null
          ? String((row.feature.properties as Record<string, unknown>)['id'])
          : '';
      const colon = row.id.indexOf(':');
      const suffix = colon >= 0 ? row.id.slice(colon + 1) : '';
      return (
        (featureId !== '' && requested.has(featureId)) ||
        (propId !== '' && requested.has(propId)) ||
        (suffix !== '' && requested.has(suffix))
      );
    })
    .map((row) => row.id);
}

export function attributeTableRowsToFeatureCollection(
  rows: AttributeTableRow[],
): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: rows.map((row) => row.feature),
  };
}

export async function exportAttributeTableRows(
  rows: AttributeTableRow[],
  format: GeoExportFormat = 'geojson',
  filename = 'attribute-table',
): Promise<void> {
  if (rows.length === 0) return;
  await exportFeatureCollectionGeo(
    attributeTableRowsToFeatureCollection(rows),
    format,
    { filename },
  );
}
