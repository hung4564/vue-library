export type TreeValueType =
  | 'null'
  | 'undefined'
  | 'string'
  | 'number'
  | 'boolean'
  | 'function'
  | 'array'
  | 'object'
  | 'symbol'
  | 'bigint';

export function getValueType(data: unknown): TreeValueType {
  if (data === null) return 'null';
  if (data === undefined) return 'undefined';
  if (Array.isArray(data)) return 'array';
  return typeof data as TreeValueType;
}

export function hasChildren(data: unknown): boolean {
  const t = getValueType(data);
  if (t === 'object' || t === 'array') return true;
  if (t === 'function') {
    try {
      return Object.keys(data as object).length > 0;
    } catch {
      return false;
    }
  }
  return false;
}

export function childKeys(data: unknown): string[] {
  if (!hasChildren(data)) return [];
  try {
    return Object.keys(data as object);
  } catch {
    return [];
  }
}

export function displayValue(data: unknown): string {
  if (data === null) return 'null';
  if (data === undefined) return 'undefined';
  const t = getValueType(data);
  if (t === 'string') return `"${data as string}"`;
  if (t === 'function') {
    const fn = data as { name?: string };
    return `f ${fn.name || 'anonymous'}()`;
  }
  if (t === 'array') return `Array(${(data as unknown[]).length})`;
  if (t === 'object') {
    const ctor = (data as { constructor?: { name?: string } }).constructor;
    if (ctor?.name && ctor.name !== 'Object') return ctor.name;
    return 'Object';
  }
  return String(data);
}

export function previewValue(data: unknown): string {
  const t = getValueType(data);
  if (t === 'array') return '[...]';
  if (t === 'object') return '{...}';
  return '';
}
