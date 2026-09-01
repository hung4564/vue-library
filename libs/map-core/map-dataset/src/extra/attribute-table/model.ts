import type { Feature, FeatureCollection } from 'geojson';

export const ATTRIBUTE_TABLE_COMPONENT_KEY = 'attribute-table';
export const ATTRIBUTE_TABLE_GEOMETRY_KEY = '__geometry';

export type AttributeTableColumn = {
  key: string;
  label: string;
};

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

export function buildAttributeTable(collection: FeatureCollection): {
  columns: AttributeTableColumn[];
  rows: AttributeTableRow[];
} {
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

  const rows: AttributeTableRow[] = collection.features.map((feature, index) => {
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
  });

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
