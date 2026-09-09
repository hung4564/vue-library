import type { AttributeTableRow } from './model';

export type AttributeTableSortDir = 'asc' | 'desc';

export type AttributeTableSortState = {
  key: string;
  dir: AttributeTableSortDir;
};

export function toggleAttributeTableSort(
  current: AttributeTableSortState | null,
  key: string,
): AttributeTableSortState {
  if (current?.key === key) {
    return { key, dir: current.dir === 'asc' ? 'desc' : 'asc' };
  }
  return { key, dir: 'asc' };
}

export function sortAttributeTableRows(
  rows: AttributeTableRow[],
  sort: AttributeTableSortState | null,
): AttributeTableRow[] {
  if (!sort) return rows;
  const { key, dir } = sort;
  const factor = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a.cells[key];
    const bv = b.cells[key];
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
  });
}
