import { describe, expect, it } from 'vitest';
import { diffLocaleKeys } from '@hungpvq/map-core';
import {
  ATTRIBUTE_TABLE_LOCALE,
  formatAttributeTableSelectionStatus,
} from './locale';
import { ATTRIBUTE_TABLE_LOCALE_VI } from './locale/locale.vi';

describe('attribute-table locale a11y', () => {
  const keys = ATTRIBUTE_TABLE_LOCALE.map['attribute-table'];

  it('exposes a11y locale strings', () => {
    expect(keys.table).toBeTruthy();
    expect(keys.gridRegion).toBeTruthy();
    expect(keys.selectAll).toBeTruthy();
    expect(keys.selectRow).toBeTruthy();
    expect(keys.actionsColumn).toBeTruthy();
    expect(keys.rowFilter).toBeTruthy();
    expect(keys.columnFilter).toBeTruthy();
    expect(keys.columnFilterQuery).toBeTruthy();
    expect(keys.clearColumnFilter).toBeTruthy();
    expect(keys.columnFilterFor).toContain('{column}');
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

  it('keeps EN and VI catalog key parity', () => {
    const { missingInA, missingInB } = diffLocaleKeys(
      ATTRIBUTE_TABLE_LOCALE,
      ATTRIBUTE_TABLE_LOCALE_VI,
    );
    expect(missingInB).toEqual([]);
    expect(missingInA).toEqual([]);
  });
});
