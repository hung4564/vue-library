import { beforeEach, describe, expect, it, vi } from 'vitest';

const runMapControlAction = vi.fn();
const closeIdentifyExclusiveUi = vi.fn();
const handleMenuAction = vi.fn();
const findSiblingOrNearestLeaf = vi.fn();

vi.mock('@hungpvq/map-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hungpvq/map-core')>();
  return {
    ...actual,
    runMapControlAction: (...args: unknown[]) => runMapControlAction(...args),
  };
});

vi.mock('./close-exclusive-ui', () => ({
  closeIdentifyExclusiveUi: (...args: unknown[]) =>
    closeIdentifyExclusiveUi(...args),
}));

vi.mock('../menu/handle', () => ({
  handleMenuAction: (...args: unknown[]) => handleMenuAction(...args),
}));

vi.mock('../model/visitors/helpers', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../model/visitors/helpers')>();
  return {
    ...actual,
    findSiblingOrNearestLeaf: (...args: unknown[]) =>
      findSiblingOrNearestLeaf(...args),
  };
});

import { LIST_VIEW_MENU_ID } from '../menu/items';
import { IDENTIFY_RESULT_CONTROL } from './result';
import { identifyResolver } from './resolver';

function resultUpdates() {
  return runMapControlAction.mock.calls.filter(
    (call) =>
      call[1] === IDENTIFY_RESULT_CONTROL.id &&
      call[2] === IDENTIFY_RESULT_CONTROL.actionUpdate,
  );
}

describe('identifyResolver', () => {
  beforeEach(() => {
    runMapControlAction.mockClear();
    closeIdentifyExclusiveUi.mockClear();
    handleMenuAction.mockClear();
    findSiblingOrNearestLeaf.mockReset();
  });

  it('dismisses exclusive UI before resolving a new identify', async () => {
    await identifyResolver.execute({
      records: [],
      mapId: 'map-1',
    });
    expect(closeIdentifyExclusiveUi).toHaveBeenCalledWith('map-1');
  });

  it('opens show-detail without auto-opening the result panel', async () => {
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

    expect(handleMenuAction).toHaveBeenCalledOnce();

    const updates = resultUpdates();
    expect(updates.find((c) => Array.isArray((c[3] as { items?: unknown }).items))?.[3]).toMatchObject({
      items: [
        {
          id: 'id-1',
          items: [expect.objectContaining({ id: '1', name: 'A' })],
        },
      ],
      origin: { latitude: 21.1, longitude: 105.5 },
    });
    expect(
      updates.some((call) => (call[3] as { show?: boolean }).show === true),
    ).toBe(false);
    expect(
      updates.some((call) => (call[3] as { show?: boolean }).show === false),
    ).toBe(false);
  });

  it('opens attribute table without auto-opening the result panel', async () => {
    const features = [
      { id: '1', name: 'A', data: {} },
      { id: '2', name: 'B', data: {} },
    ];
    const list = {
      id: 'list-1',
      getMenu: (key: string) =>
        key === LIST_VIEW_MENU_ID.layer.attributeTable
          ? { id: 'attribute-table' }
          : undefined,
    };
    findSiblingOrNearestLeaf.mockReturnValue(list);

    const identify = {
      id: 'id-1',
      getName: () => 'Layer',
      hasMenu: () => false,
      config: {},
    };

    await identifyResolver.execute({
      records: [{ identify: identify as never, features: features as never }],
      mapId: 'map-1',
      singleLayer: true,
    });

    expect(handleMenuAction).toHaveBeenCalled();
    const updates = resultUpdates();
    expect(
      updates.some((call) => (call[3] as { show?: boolean }).show === true),
    ).toBe(false);
    expect(
      updates.some((call) => (call[3] as { show?: boolean }).show === false),
    ).toBe(false);
  });

  it('auto-opens result panel when no exclusive detail/table applies', async () => {
    const feature = {
      id: '1',
      name: 'A',
      data: { id: '1', name: 'A' },
    };
    const identify = {
      id: 'id-1',
      getName: () => 'Layer',
      hasMenu: () => false,
      config: {},
    };
    findSiblingOrNearestLeaf.mockReturnValue(undefined);

    await identifyResolver.execute({
      records: [{ identify: identify as never, features: [feature as never] }],
      mapId: 'map-1',
      singleLayer: false,
    });

    expect(handleMenuAction).not.toHaveBeenCalled();
    expect(
      resultUpdates().some(
        (call) => (call[3] as { show?: boolean }).show === true,
      ),
    ).toBe(true);
  });
});
