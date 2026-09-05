import type { FilterSpecification } from '../types';

/**
 * Merge multiple filters with AND or OR operator
 */
export function mergeFilters(
  filters: (FilterSpecification | null | undefined)[],
  operator: 'all' | 'any' = 'all',
): FilterSpecification | null {
  const validFilters = filters.filter((f): f is FilterSpecification => !!f);

  if (validFilters.length === 0) {
    return null;
  }

  if (validFilters.length === 1) {
    return validFilters[0];
  }

  return [operator, ...validFilters] as FilterSpecification;
}
