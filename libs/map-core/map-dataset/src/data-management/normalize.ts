import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { DataRecord, ID, NormalizeOptions } from './types';

const DEFAULT_GEOMETRY_FIELDS = ['geometry', 'geom', 'geo'];

function isGeometryObject(value: unknown): value is Geometry {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as Geometry).type === 'string' &&
    'coordinates' in (value as Geometry)
  );
}

function parseGeometryValue(value: unknown): Geometry | null {
  if (value == null) return null;
  if (isGeometryObject(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (isGeometryObject(parsed)) return parsed;
      if (
        parsed &&
        typeof parsed === 'object' &&
        (parsed as Feature).type === 'Feature' &&
        isGeometryObject((parsed as Feature).geometry)
      ) {
        return (parsed as Feature).geometry;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export function pickGeometry(
  row: Record<string, unknown>,
  geometryFields: string[] = DEFAULT_GEOMETRY_FIELDS,
): Geometry | null {
  for (const field of geometryFields) {
    if (field in row) {
      const geom = parseGeometryValue(row[field]);
      if (geom) return geom;
    }
  }
  return null;
}

export function resolveRecordId(
  input: Record<string, unknown>,
  idField = 'id',
): ID | undefined {
  if (input[idField] != null) return input[idField] as ID;
  if (input['id'] != null) return input['id'] as ID;
  const props = input['properties'];
  if (props && typeof props === 'object' && !Array.isArray(props)) {
    const p = props as Record<string, unknown>;
    if (p[idField] != null) return p[idField] as ID;
    if (p['id'] != null) return p['id'] as ID;
  }
  return undefined;
}

export function toRecord(
  input: unknown,
  options: NormalizeOptions = {},
): DataRecord | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const row = input as Record<string, unknown>;
  const idField = options.idField ?? 'id';
  const geometryFields = options.geometryFields ?? DEFAULT_GEOMETRY_FIELDS;

  if (row['type'] === 'Feature') {
    const feature = row as unknown as Feature;
    const props =
      feature.properties && typeof feature.properties === 'object'
        ? { ...(feature.properties as Record<string, unknown>) }
        : {};
    const id = resolveRecordId(
      { id: feature.id, properties: props },
      idField,
    );
    const geometry =
      parseGeometryValue(feature.geometry) ??
      pickGeometry(props, geometryFields);
    const record: DataRecord = { ...props, geometry };
    if (id != null) record.id = id;
    return record;
  }

  const geometry = pickGeometry(row, geometryFields);
  const record: DataRecord = { ...row };
  for (const field of geometryFields) {
    if (field !== 'geometry') delete record[field];
  }
  record.geometry = geometry;
  const id = resolveRecordId(row, idField);
  if (id != null) record.id = id;
  delete record['properties'];
  delete record['type'];
  return record;
}

export function toFeature(record: DataRecord | undefined | null): Feature | undefined {
  if (!record) return undefined;
  const { geometry, id, ...rest } = record;
  const properties: Record<string, unknown> = { ...rest };
  if (id != null && properties['id'] == null) properties['id'] = id;
  return {
    type: 'Feature',
    id: id as string | number | undefined,
    geometry: (geometry ?? {
      type: 'Point',
      coordinates: [0, 0],
    }) as Geometry,
    properties,
  };
}

export function toFeatureCollection(
  records: Array<DataRecord | undefined | null>,
): FeatureCollection {
  const features: Feature[] = [];
  for (const record of records) {
    const feature = toFeature(record ?? undefined);
    if (feature && feature.geometry) features.push(feature);
  }
  return { type: 'FeatureCollection', features };
}

export function normalizeInitData(
  initData: unknown,
  options: NormalizeOptions & { format?: 'auto' | 'feature-collection' | 'list' } = {},
): DataRecord[] {
  if (initData == null) return [];
  const format = options.format ?? 'auto';

  if (
    format === 'feature-collection' ||
    (format === 'auto' &&
      typeof initData === 'object' &&
      (initData as FeatureCollection).type === 'FeatureCollection')
  ) {
    const fc = initData as FeatureCollection;
    return (fc.features ?? [])
      .map((f) => toRecord(f, options))
      .filter((x): x is DataRecord => !!x);
  }

  if (Array.isArray(initData)) {
    return initData
      .map((item) => toRecord(item, options))
      .filter((x): x is DataRecord => !!x);
  }

  const single = toRecord(initData, options);
  return single ? [single] : [];
}
