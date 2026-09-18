import { describe, expect, it } from 'vitest';
import { createDataManagement, isDataManagementView } from './dataset-part';

describe('createDataManagement', () => {
  it('creates a data-management leaf with list', async () => {
    const part = createDataManagement('records', {
      store: 'local',
      format: 'list',
      initData: [
        {
          id: 1,
          name: 'a',
          geom: { type: 'Point', coordinates: [1, 2] },
        },
      ],
      geometryFields: ['geometry', 'geom', 'geo'],
    });

    expect(part.type).toBe('data-management');
    expect(isDataManagementView(part)).toBe(true);

    const all = await part.list({ pageSize: 'all' });
    expect(all.items).toHaveLength(1);
    expect(all.items[0].geometry).toEqual({ type: 'Point', coordinates: [1, 2] });

    const page = await part.list({ page: 1, pageSize: 10 });
    expect(page.total).toBe(1);
    expect(page.items[0].name).toBe('a');
  });
});
