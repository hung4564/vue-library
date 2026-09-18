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
