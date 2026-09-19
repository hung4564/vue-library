import { runMapControlAction } from '@hungpvq/map-core';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { GEOJSON_FEATURE_ID_KEY } from '../geojson/feature-id';

export const ATTRIBUTE_TABLE_GEOMETRY_KEY = '__geometry';

/**
 * Property keys starting with `_` are internal (e.g. `_id`) — hidden from
 * auto-inferred columns, still used for Identify↔table select keys.
 */
export function isAttributeTableInternalPropertyKey(key: string): boolean {
  return key.startsWith('_');
}

/** AttributeTable registry id + select action (must match useRegisterMapControl). */
export const ATTRIBUTE_TABLE_CONTROL = {
  id: 'mapAttributeTable',
  actionSelectRows: 'mapAttributeTable.selectRows',
} as const;

/** Per-layer control id so multiple tables do not overwrite each other. */
export function attributeTableControlId(layerId: string): string {
  return `${ATTRIBUTE_TABLE_CONTROL.id}:${layerId}`;
}

/**
 * Stable select key: `_id` → `properties.id` → string `feature.id`.
 * Never geometry; skip numeric Feature.id (MapLibre without promoteId).
 */
function selectKeyFromFeature(feature: Feature | null | undefined): string {
  if (!feature) return '';
  const props = feature.properties;
  if (props && typeof props === 'object') {
    const stable = props[GEOJSON_FEATURE_ID_KEY];
    if (stable != null && String(stable) !== '') return String(stable);
    const propId = props['id'];
    if (propId != null && String(propId) !== '') return String(propId);
  }
  // String feature.id only (promoteId `_id` / business ids). Skip MapLibre numbers.
  if (
    feature.id != null &&
    typeof feature.id !== 'number' &&
    String(feature.id) !== ''
  ) {
    return String(feature.id);
  }
  return '';
}

/**
 * Key for Identify → AttributeTable selectRows.
 * Only stable ids (`_id` / business id) — never geometry or MapLibre numeric ids.
 */
export function attributeTableIdentifyRowSelectKey(row: {
  id?: string | number;
  data?: unknown;
}): string {
  const data = row.data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;

    if (d['type'] === 'Feature' && 'geometry' in d) {
      return selectKeyFromFeature(d as Feature);
    }

    const props: Record<string, unknown> = { ...d };
    delete props['geometry'];
    // Drop MapLibre numeric `id` before keying (not stable across zoom).
    if (typeof props['id'] === 'number') {
      delete props['id'];
    }

    const fromFeature = selectKeyFromFeature({
      type: 'Feature',
      properties: props,
      geometry: (d['geometry'] as Geometry | null | undefined) ?? null,
    });
    if (fromFeature) return fromFeature;
  }
  if (row.id != null && String(row.id) !== '' && typeof row.id !== 'number') {
    return String(row.id);
  }
  return '';
}

export type AttributeTableSelectRowsPayload = {
  ids: string[];
  /** Target table layer; required when multiple AttributeTables may be mounted. */
  layerId?: string;
};

/**
 * Selection requested before AttributeTable control is registered (e.g. identify
 * opens the table via addComponent). Flushed on mount / after selectRows runs.
 * Keyed by mapId + layerId so a stale table cannot steal another layer's queue.
 */
const pendingSelectRowsByKey = new Map<string, string[]>();

function pendingSelectRowsKey(mapId: string, layerId?: string): string {
  return layerId ? `${mapId}::${layerId}` : mapId;
}

export function queueAttributeTableSelectRows(
  mapId: string,
  ids: string[],
  layerId?: string,
): void {
  const normalized = ids.map(String);
  const key = pendingSelectRowsKey(mapId, layerId);
  pendingSelectRowsByKey.set(key, normalized);
  const controlId = layerId
    ? attributeTableControlId(layerId)
    : ATTRIBUTE_TABLE_CONTROL.id;
  runMapControlAction(
    mapId,
    controlId,
    ATTRIBUTE_TABLE_CONTROL.actionSelectRows,
    {
      ids: normalized,
      ...(layerId ? { layerId } : {}),
    } satisfies AttributeTableSelectRowsPayload,
  );
}

/** Peek pending ids (cleared only via clearPending / successful apply). */
export function takePendingAttributeTableSelectRows(
  mapId: string,
  layerId?: string,
): string[] | null {
  const keyed = pendingSelectRowsByKey.get(pendingSelectRowsKey(mapId, layerId));
  if (keyed) return keyed;
  // Legacy queue without layerId (pre-per-layer key).
  if (layerId) return pendingSelectRowsByKey.get(mapId) ?? null;
  return null;
}

export function clearPendingAttributeTableSelectRows(
  mapId: string,
  layerId?: string,
): void {
  pendingSelectRowsByKey.delete(pendingSelectRowsKey(mapId, layerId));
  if (layerId) pendingSelectRowsByKey.delete(mapId);
}

export type AttributeTableCellFormatContext = {
  feature: Feature;
  rowId: string;
  key: string;
};

export type AttributeTableColumn = {
  key: string;
  label: string;
  /** Default true. When false, header is not sortable. */
  sortable?: boolean;
  /** Format raw property/geometry value into the display string in `row.cells`. */
  format?: (
    value: unknown,
    ctx: AttributeTableCellFormatContext,
  ) => string;
  /**
   * Custom cell: Registry `componentKey` (`string`) or a Vue/React component.
   * Grid resolves via `RegistryItem`.
   */
  cellComponent?: unknown;
  /**
   * Custom header: Registry `componentKey` (`string`) or a Vue/React component.
   * Grid resolves via `RegistryItem`.
   */
  headerComponent?: unknown;
};

export type AttributeTableColumnDef =
  | string
  | {
      key: string;
      label?: string;
      sortable?: boolean;
      format?: AttributeTableColumn['format'];
      cellComponent?: unknown;
      headerComponent?: unknown;
    };

export type AttributeTableColumnsOption =
  AttributeTableColumnDef[] | Record<string, string>;

export type AttributeTableRow = {
  id: string;
  feature: Feature;
  cells: Record<string, string>;
};

/** Props passed to custom cell components via AttributeTableGrid. */
export type AttributeTableCellProps = {
  value: string;
  raw: unknown;
  row: AttributeTableRow;
  column: AttributeTableColumn;
};

/** Props passed to custom header components via AttributeTableGrid. */
export type AttributeTableHeaderProps = {
  label: string;
  column: AttributeTableColumn;
  sortable: boolean;
  /** Current sort direction for this column when sorted. */
  sortDir?: 'asc' | 'desc';
  /** 1-based order among active multi-sort columns. */
  sortOrder?: number;
  /** Total number of active sort columns. */
  sortCount?: number;
  /**
   * Call to toggle sort when `sortable` is true.
   * Pass `true` for multi-sort append (Shift+click equivalent).
   */
  onSort?: (append?: boolean) => void;
};

/**
 * Split `cellComponent` / `headerComponent` for RegistryItem:
 * - `string` → `componentKey` (UniversalRegistry)
 * - otherwise → framework component as `defaultComponent`
 */
export function resolveAttributeTableComponentRef(value: unknown): {
  componentKey?: string;
  defaultComponent?: unknown;
} {
  if (value == null || value === '') return {};
  if (typeof value === 'string') {
    const key = value.trim();
    return key ? { componentKey: key } : {};
  }
  return { defaultComponent: value };
}

function normalizeColumnDef(item: AttributeTableColumnDef): AttributeTableColumn {
  if (typeof item === 'string') {
    return { key: item, label: item, sortable: true };
  }
  return {
    key: item.key,
    label: item.label || item.key,
    sortable: item.sortable !== false,
    format: item.format,
    cellComponent: item.cellComponent,
    headerComponent: item.headerComponent,
  };
}

/** Raw cell value for custom renderers (property or geometry type). */
export function getAttributeTableCellRaw(
  row: AttributeTableRow,
  column: AttributeTableColumn,
): unknown {
  if (column.key === ATTRIBUTE_TABLE_GEOMETRY_KEY) {
    return row.feature.geometry?.type ?? '';
  }
  const props = row.feature.properties;
  if (!props || typeof props !== 'object') return undefined;
  return (props as Record<string, unknown>)[column.key];
}

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
      sortable: true,
    }));
  }
  if (Array.isArray(option) && option.length > 0) {
    return option.map(normalizeColumnDef);
  }
  const keys = new Set<string>();
  for (const feature of collection.features) {
    const props = feature.properties;
    if (!props || typeof props !== 'object') continue;
    Object.keys(props).forEach((key) => {
      if (isAttributeTableInternalPropertyKey(key)) return;
      keys.add(key);
    });
  }
  const columns: AttributeTableColumn[] = Array.from(keys)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({ key, label: key, sortable: true }));
  columns.push({
    key: ATTRIBUTE_TABLE_GEOMETRY_KEY,
    label: 'Geometry',
    sortable: true,
  });
  return columns;
}

export function buildAttributeTable(
  collection: FeatureCollection,
  columnsOption?: AttributeTableColumnsOption,
  options?: { indexOffset?: number },
): {
  columns: AttributeTableColumn[];
  rows: AttributeTableRow[];
} {
  const columns = resolveAttributeTableColumns(collection, columnsOption);
  const indexOffset = options?.indexOffset ?? 0;
  const rows: AttributeTableRow[] = collection.features.map(
    (feature, index) => {
      const props = (feature.properties ?? {}) as Record<string, unknown>;
      const selectKey = selectKeyFromFeature(feature);
      const rowIndex = indexOffset + index;
      // Always prefix with rowIndex; suffix is a stable select key (id or geometry).
      // Never use bare index alone when a select key exists — Identify query indices
      // (`0`,`1`,…) must not collide with global row indices.
      const id = selectKey ? `${rowIndex}:${selectKey}` : String(rowIndex);
      const cells: Record<string, string> = {};
      for (const column of columns) {
        const raw =
          column.key === ATTRIBUTE_TABLE_GEOMETRY_KEY
            ? (feature.geometry?.type ?? '')
            : props[column.key];
        if (column.format) {
          cells[column.key] = column.format(raw, {
            feature,
            rowId: id,
            key: column.key,
          });
        } else if (column.key === ATTRIBUTE_TABLE_GEOMETRY_KEY) {
          cells[column.key] = typeof raw === 'string' ? raw : '';
        } else {
          cells[column.key] = formatAttributeCell(raw);
        }
      }
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
 * (`index:selectKey` or plain index).
 */
export function resolveAttributeTableSelectedRowIds(
  requestedIds: string[],
  rows: AttributeTableRow[],
): string[] {
  if (requestedIds.length === 0) return [];
  const requested = new Set(requestedIds.map(String).filter((id) => id !== ''));
  if (!requested.size) return [];
  return rows
    .filter((row) => {
      if (requested.has(row.id)) return true;
      const selectKey = selectKeyFromFeature(row.feature);
      if (selectKey && requested.has(selectKey)) return true;
      const colon = row.id.indexOf(':');
      const suffix = colon >= 0 ? row.id.slice(colon + 1) : '';
      return suffix !== '' && requested.has(suffix);
    })
    .map((row) => row.id);
}
