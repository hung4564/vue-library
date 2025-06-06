/**
 * Gộp 2 filter Maplibre bằng toán tử "all" hoặc "any"
 * @param filter1 - Filter thứ nhất
 * @param filter2 - Filter thứ hai
 * @param operator - 'all' | 'any' (mặc định: 'all')
 * @returns Filter mới đã gộp
 */
export function mergeFilters(
  filter1: any | null | undefined,
  filter2: any | null | undefined,
  operator: 'all' | 'any' = 'all',
): any | null {
  const filters: any[] = [];

  if (filter1 && Array.isArray(filter1)) filters.push(filter1);
  if (filter2 && Array.isArray(filter2)) filters.push(filter2);

  if (filters.length === 0) return null;
  if (filters.length === 1) return filters[0];

  return [operator, ...filters];
}
