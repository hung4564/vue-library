import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  useDragContainer,
  useDragItem,
  useDragStore,
  useSidebarItem,
} from '../store';
import type { ContainerStoreAction } from '../types';
import {
  applyDragDebugAction,
  listDragDebugContainers,
  listDragDebugItems,
  registerDragItemOrigin,
} from './inspect';

const CID = 'debug-inspect-c';

function action(
  overrides: Partial<ContainerStoreAction> = {},
): ContainerStoreAction {
  return {
    type: 'item-popup',
    setZIndex: vi.fn(),
    setShow: vi.fn(),
    setHighLight: vi.fn(),
    open: vi.fn(),
    close: vi.fn(),
    ...overrides,
  };
}

afterEach(() => {
  const store = useDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
  for (const key of Object.keys(store.debugOrigins)) {
    delete store.debugOrigins[key];
  }
});

describe('drag debug inspect', () => {
  it('lists declared items with origin metadata', () => {
    useDragContainer(CID).initContainer();
    const items = useDragItem(CID);
    items.registerItem('p1', 'item-popup');
    items.registerAction('p1', action({ type: 'item-popup', title: 'Popup' }));
    registerDragItemOrigin(CID, 'p1', {
      kind: 'component',
      name: 'DemoPage',
      hook: 'useInitItem',
    });

    expect(listDragDebugContainers()).toContain(CID);
    const row = listDragDebugItems(CID).find((item) => item.id === 'p1');
    expect(row).toMatchObject({
      containerId: CID,
      id: 'p1',
      type: 'item-popup',
      title: 'Popup',
      origin: { kind: 'component', name: 'DemoPage', hook: 'useInitItem' },
    });
  });

  it('toggles show and moves sidebar location', () => {
    useDragContainer(CID).initContainer();
    const items = useDragItem(CID);
    const side = useSidebarItem(CID);
    items.registerAction(
      's1',
      action({ type: 'item-sidebar', title: 'Side', location: 'left' }),
    );
    side.registerSideBar('s1', 'left');
    side.registerSideBarShow('s1', false);

    applyDragDebugAction({
      type: 'show',
      containerId: CID,
      id: 's1',
      show: true,
    });
    expect(useDragStore().container[CID].sideBar.left.show).toBe('s1');

    applyDragDebugAction({
      type: 'location',
      containerId: CID,
      id: 's1',
      location: 'right',
    });
    const row = listDragDebugItems(CID).find((item) => item.id === 's1');
    expect(row?.location).toBe('right');
    expect(useDragStore().container[CID].sideBar.right.items).toContain('s1');
  });

  it('clears origins when the container is removed', () => {
    useDragContainer(CID).initContainer();
    useDragItem(CID).registerAction('p1', action({ title: 'Popup' }));
    registerDragItemOrigin(CID, 'p1', {
      kind: 'function',
      name: 'openLegend',
      hook: 'useInitItem',
    });
    expect(listDragDebugItems(CID)).toHaveLength(1);
    useDragContainer(CID).removeContainer();
    expect(listDragDebugItems(CID)).toEqual([]);
    expect(useDragStore().debugOrigins[`${CID}::p1`]).toBeUndefined();
  });

  it('highlights via the registered action', () => {
    useDragContainer(CID).initContainer();
    const highlight = vi.fn();
    const open = vi.fn();
    useDragItem(CID).registerAction(
      'p1',
      action({ type: 'item-popup', setHighLight: highlight, open }),
    );
    applyDragDebugAction({ type: 'highlight', containerId: CID, id: 'p1' });
    expect(open).toHaveBeenCalled();
    expect(highlight).toHaveBeenCalled();
  });

  it('opens through useDragCommands.open', () => {
    useDragContainer(CID).initContainer();
    const open = vi.fn();
    useDragItem(CID).registerAction('p1', action({ open }));
    applyDragDebugAction({
      type: 'show',
      containerId: CID,
      id: 'p1',
      show: true,
    });
    expect(open).toHaveBeenCalled();
  });

  it('keeps origin after registerAction and location updates', () => {
    useDragContainer(CID).initContainer();
    const items = useDragItem(CID);
    const side = useSidebarItem(CID);
    items.registerAction(
      's1',
      action({ type: 'item-sidebar', title: 'Side', location: 'left' }),
    );
    side.registerSideBar('s1', 'left');
    registerDragItemOrigin(CID, 's1', {
      kind: 'component',
      name: 'LayerControl',
      hook: 'useInitSidebar',
    });
    side.registerAction(
      's1',
      action({ type: 'item-sidebar', title: 'Side', location: 'left' }),
    );
    applyDragDebugAction({
      type: 'location',
      containerId: CID,
      id: 's1',
      location: 'right',
    });
    expect(
      listDragDebugItems(CID).find((item) => item.id === 's1')?.origin,
    ).toMatchObject({
      name: 'LayerControl',
      hook: 'useInitSidebar',
    });
    side.unRegisterSideBar('s1');
    expect(useDragStore().debugOrigins[`${CID}::s1`]).toBeUndefined();
  });
});
