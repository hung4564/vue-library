import { describe, expect, it, vi } from 'vitest';

import { LIST_VIEW_MENU_COMPONENT_KEY } from './items';
import {
  DATASET_REGISTRY_SLOTS,
  registerDatasetRegistryComponents,
  resolveDatasetRegistryKey,
} from './registry-plugin';

describe('registerDatasetRegistryComponents', () => {
  it('resolveDatasetRegistryKey maps slots to LIST_VIEW_MENU_COMPONENT_KEY', () => {
    expect(resolveDatasetRegistryKey('legendLinear')).toBe(
      LIST_VIEW_MENU_COMPONENT_KEY.legendLinear,
    );
    expect(resolveDatasetRegistryKey('attributeTable')).toBe(
      LIST_VIEW_MENU_COMPONENT_KEY.attributeTable,
    );
  });

  it('registers only non-null slots with stable keys', () => {
    const register = vi.fn();
    const legendLinear = { name: 'LegendLinear' };
    const identify = { name: 'Identify' };

    registerDatasetRegistryComponents(register, {
      legendLinear,
      identify,
      legendColor: undefined,
    });

    expect(register).toHaveBeenCalledTimes(2);
    expect(register).toHaveBeenCalledWith(
      LIST_VIEW_MENU_COMPONENT_KEY.legendLinear,
      legendLinear,
    );
    expect(register).toHaveBeenCalledWith(
      LIST_VIEW_MENU_COMPONENT_KEY.identify,
      identify,
    );
  });

  it('DATASET_REGISTRY_SLOTS stay ordered and cover component keys used by plugins', () => {
    expect(DATASET_REGISTRY_SLOTS[0]).toBe('legendLinear');
    expect(DATASET_REGISTRY_SLOTS).toContain('attributeTableGrid');
    expect(DATASET_REGISTRY_SLOTS.length).toBe(21);
  });
});
