import { describe, expect, it, afterEach } from 'vitest';
import { createDataset } from '../model/dataset.base';
import {
  clearGlobalDatasetMenus,
  getGlobalDatasetMenus,
  registerGlobalDatasetMenus,
} from './global-defaults';
import { createMenuItem } from './items';
import { getResolvedMenus } from './dataset';

describe('registerGlobalDatasetMenus', () => {
  afterEach(() => {
    clearGlobalDatasetMenus();
  });

  it('merges into getResolvedMenus and allows dispose', () => {
    const dispose = registerGlobalDatasetMenus([
      {
        for: 'layer',
        key: 'global-debug',
        menu: createMenuItem({
          type: 'item',
          id: 'global-debug',
          name: 'Global',
          icon: 'g',
          location: 'menu',
        }),
      },
    ]);

    expect(getGlobalDatasetMenus('layer').map((m) => m.id)).toContain(
      'global-debug',
    );

    const list = createDataset('List');
    Object.defineProperty(list, 'type', {
      configurable: true,
      get: () => 'list',
    });
    expect(getResolvedMenus(list, 'layer').map((m) => m.id)).toContain(
      'global-debug',
    );

    dispose();
    expect(getGlobalDatasetMenus('layer').map((m) => m.id)).not.toContain(
      'global-debug',
    );
  });
});
