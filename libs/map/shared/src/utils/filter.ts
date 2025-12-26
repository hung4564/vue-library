import { FilterSpecification } from '../types';

/**
 * Gộp nhiều filter Maplibre bằng toán tử "all" hoặc "any"
 * @param filters - Mảng các filter (có thể null/undefined)
 * @param operator - 'all' | 'any' (mặc định: 'all')
 * @returns Filter mới đã gộp
 */
export function mergeFilters(
  filters: (FilterSpecification | null | undefined)[],
  operator: 'all' | 'any' = 'all',
): FilterSpecification | null {
  const validFilters = filters.filter(
    (f): f is FilterSpecification => Array.isArray(f) && f.length > 0,
  );

  if (validFilters.length === 0) return null;
  if (validFilters.length === 1) return validFilters[0];

  return [operator, ...validFilters] as FilterSpecification;
}
