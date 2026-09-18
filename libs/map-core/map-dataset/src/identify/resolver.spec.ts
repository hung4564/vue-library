import { beforeEach, describe, expect, it, vi } from 'vitest';

const runMapControlAction = vi.fn();

vi.mock('@hungpvq/map-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hungpvq/map-core')>();
  return {
    ...actual,
    runMapControlAction: (...args: unknown[]) => runMapControlAction(...args),
  };
});

vi.mock('../menu', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../menu')>();
  return {
    ...actual,
    handleMenuAction: vi.fn(),
  };
});

import { LIST_VIEW_MENU_ID } from '../menu';
import { IDENTIFY_RESULT_CONTROL } from './result';
import { identifyResolver } from './resolver';

describe('identifyResolver', () => {
  beforeEach(() => {
    runMapControlAction.mockClear();
  });

  it('updates items + opens result panel even when exclusive show-detail runs', async () => {
    const feature = {
      id: '1',
      name: 'A',
      data: { id: '1', name: 'A' },
    };
    const identify = {
      id: 'id-1',
      getName: () => 'Layer',
      hasMenu: (key: string) => key === LIST_VIEW_MENU_ID.item.showDetail,
      getMenu: () => ({ id: 'show-detail' }),
      config: {},
    };

    await identifyResolver.execute({
      records: [{ identify: identify as never, features: [feature as never] }],
      mapId: 'map-1',
      singleLayer: true,
      event: {
        lngLat: { lng: 105.5, lat: 21.1 },
      } as never,
    });

    const updates = runMapControlAction.mock.calls.filter(
      (call) =>
        call[1] === IDENTIFY_RESULT_CONTROL.id &&
        call[2] === IDENTIFY_RESULT_CONTROL.actionUpdate,
    );
    expect(updates.length).toBeGreaterThanOrEqual(2);

    const withItems = updates.find(
      (call) => Array.isArray((call[3] as { items?: unknown }).items),
    );
    expect(withItems?.[3]).toMatchObject({
      items: [
        {
          id: 'id-1',
          items: [expect.objectContaining({ id: '1', name: 'A' })],
        },
      ],
      origin: { latitude: 21.1, longitude: 105.5 },
    });

    const withShow = updates.find(
      (call) => (call[3] as { show?: boolean }).show === true,
    );
    expect(withShow).toBeTruthy();
  });
});
