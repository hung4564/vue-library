export const ATTRIBUTE_TABLE_LOCALE = {
  map: {
    'attribute-table': {
      title: 'Attribute table',
      table: 'Attribute table',
      gridRegion: 'Table rows',
      search: 'Search',
      empty: 'No features',
      loading: 'Loading…',
      zoomToSelection: 'Zoom to selection',
      showAll: 'All rows',
      showSelected: 'Selected',
      clear: 'Clear selection',
      page: 'Page',
      of: 'of',
      prev: 'Prev',
      next: 'Next',
      rowsPerPage: 'Rows',
      selectAll: 'Select all rows',
      selectRow: 'Select row',
      actionsColumn: 'Row actions',
      rowFilter: 'Filter rows',
      columnFilter: 'Column filter',
      columnFilterQuery: 'Contains…',
      columnFilterQueryEquals: 'Equals…',
      columnFilterQueryNumber: 'Number…',
      columnFilterQueryNumberBetween: '1..10',
      columnFilterQueryDate: 'Date…',
      clearColumnFilter: 'Clear column filters',
      columnFilterFor: 'Filter {column}',
      columnFilterMode: 'Filter mode',
      columnFilterModeContains: 'Contains',
      columnFilterModeEquals: 'Equals',
      columnFilterModeNumberEq: 'Number =',
      columnFilterModeNumberGte: 'Number ≥',
      columnFilterModeNumberLte: 'Number ≤',
      columnFilterModeNumberBetween: 'Number between',
      columnFilterModeDateEq: 'Date =',
      columnFilterModeDateGte: 'Date ≥',
      columnFilterModeDateLte: 'Date ≤',
      columnsVisibility: 'Columns',
      columnsShowAll: 'Show all columns',
      sortedAsc: 'sorted ascending',
      sortedDesc: 'sorted descending',
      notSorted: 'not sorted',
      selectionStatus: '{selected} of {total} selected',
      export: 'Export',
    },
  },
};

/** Fill `{selected}` / `{total}` placeholders in `selectionStatus`. */
export function formatAttributeTableSelectionStatus(
  template: string,
  selected: number,
  total: number,
): string {
  return template
    .replace(/\{selected\}/g, String(selected))
    .replace(/\{total\}/g, String(total));
}
