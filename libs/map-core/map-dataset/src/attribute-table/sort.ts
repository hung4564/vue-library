import type { AttributeTableRow } from './model';

export type AttributeTableSortDir = 'asc' | 'desc';

export type AttributeTableSortState = {
  key: string;
  dir: AttributeTableSortDir;
};

function compareCellValues(
  av: unknown,
  bv: unknown,
  dir: AttributeTableSortDir,
): number {
  const factor = dir === 'asc' ? 1 : -1;
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  const an = Number(av);
  const bn = Number(bv);
  if (Number.isFinite(an) && Number.isFinite(bn) && av !== '' && bv !== '') {
    return (an - bn) * factor;
  }
  return (
    String(av).localeCompare(String(bv), undefined, {
      numeric: true,
      sensitivity: 'base',
    }) * factor
  );
}

/** Toggle primary sort: none → asc → desc → none. */
export function toggleAttributeTableSort(
  current: AttributeTableSortState | null,
  key: string,
): AttributeTableSortState | null {
  if (current?.key !== key) {
    return { key, dir: 'asc' };
  }
  if (current.dir === 'asc') {
    return { key, dir: 'desc' };
  }
  return null;
}

/**
 * Multi-sort toggle.
 * - Normal click: replace with this key cycling none → asc → desc → none.
 * - `append` (e.g. Shift+click): add/cycle/remove that key in the list.
 */
export function toggleAttributeTableMultiSort(
  current: AttributeTableSortState[],
  key: string,
  append = false,
): AttributeTableSortState[] {
  const index = current.findIndex((s) => s.key === key);
  if (!append) {
    if (index === 0) {
      const dir = current[0]?.dir;
      if (dir === 'asc') return [{ key, dir: 'desc' }];
      return [];
    }
    return [{ key, dir: 'asc' }];
  }
  if (index >= 0) {
    const next = current.slice();
    const item = next[index];
    if (item.dir === 'asc') {
      next[index] = { key, dir: 'desc' };
      return next;
    }
    next.splice(index, 1);
    return next;
  }
  return [...current, { key, dir: 'asc' }];
}

export function sortAttributeTableRows(
  rows: AttributeTableRow[],
  sort: AttributeTableSortState | AttributeTableSortState[] | null,
): AttributeTableRow[] {
  const sorts = Array.isArray(sort) ? sort : sort ? [sort] : [];
  if (!sorts.length) return rows;
  return [...rows].sort((a, b) => {
    for (const { key, dir } of sorts) {
      const cmp = compareCellValues(a.cells[key], b.cells[key], dir);
      if (cmp !== 0) return cmp;
    }
    return String(a.id).localeCompare(String(b.id));
  });
}
