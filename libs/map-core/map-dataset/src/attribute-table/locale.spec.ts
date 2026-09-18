import { describe, expect, it } from 'vitest';
import {
  ATTRIBUTE_TABLE_LOCALE,
  formatAttributeTableSelectionStatus,
} from './locale';

describe('attribute-table locale a11y', () => {
  const keys = ATTRIBUTE_TABLE_LOCALE.map['attribute-table'];

  it('exposes a11y locale strings', () => {
    expect(keys.table).toBeTruthy();
    expect(keys.gridRegion).toBeTruthy();
    expect(keys.selectAll).toBeTruthy();
    expect(keys.selectRow).toBeTruthy();
    expect(keys.actionsColumn).toBeTruthy();
    expect(keys.rowFilter).toBeTruthy();
    expect(keys.sortedAsc).toBeTruthy();
    expect(keys.sortedDesc).toBeTruthy();
    expect(keys.notSorted).toBeTruthy();
    expect(keys.selectionStatus).toContain('{selected}');
    expect(keys.selectionStatus).toContain('{total}');
  });

  it('formats selection status placeholders', () => {
    expect(
      formatAttributeTableSelectionStatus(keys.selectionStatus, 2, 10),
    ).toBe('2 of 10 selected');
  });
});
