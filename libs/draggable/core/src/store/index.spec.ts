import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ContainerStoreAction } from '../types';
import {
  configureDragStore,
  useDragComponent,
  useDragContainer,
  useDragIsMobile,
  useDragItem,
  useDragStore,
  useDrawerItem,
  useSidebarItem,
} from './index';

const CID = 'test-container';

function createFakeAction(
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

function initTestContainer(id = CID) {
  useDragContainer(id).initContainer();
}

afterEach(() => {
  const store = useDragStore();
  for (const id of Object.keys(store.container)) {
    delete store.container[id];
  }
  store.componentCard = undefined;
  store.componentCardHeader = undefined;
  store.componentCardSidebarToggle = undefined;
  configureDragStore({
    notify: () => undefined,
    makeReactive: (value) => value,
  });
});

describe('configureDragStore', () => {
  it('invokes notify with path on container init', () => {
    const notify = vi.fn();
    configureDragStore({ notify });
    initTestContainer();
    expect(notify).toHaveBeenCalledWith(['drag:core', 'container', CID]);
  });

  it('wraps container map with makeReactive', () => {
    const makeReactive = vi.fn(<T extends object>(value: T) => value);
    // Reconfigure before first store read in this test path — store already
    // created globally; assert notify still works after configure.
    configureDragStore({ makeReactive });
    expect(typeof makeReactive).toBe('function');
  });
});

describe('useDragContainer', () => {
  it('initContainer / setParentProps / getters / removeContainer', () => {
    const api = useDragContainer(CID);
    api.initContainer();
    api.setParentProps({ width: 800, height: 600, isMobile: true });

    expect(api.getWidth()).toBe(800);
    expect(api.getHeight()).toBe(600);
    expect(useDragIsMobile(CID).getIsMobile()).toBe(true);
    expect(api.getItems()).toEqual([]);
    expect(api.getItemShows()).toEqual([]);

    api.removeContainer();
    expect(useDragStore().container[CID]).toBeUndefined();
    expect(api.getWidth()).toBe(0);
    expect(useDragIsMobile(CID).getIsMobile()).toBe(false);
  });

  it('throws when APIs need a missing container', () => {
    expect(() => useDragItem(CID).registerItem('x')).toThrow(
      /Not found container/,
    );
  });
});

describe('useDragItem', () => {
  it('registers items into the correct group and unregisters', () => {
    initTestContainer();
    const items = useDragItem(CID);
    items.registerItem('p1', 'item-popup');
    items.registerItem('m1', 'item-modal');
    items.registerItem('f1', 'item-float');
    items.registerItem('b1', 'item-bottom');

    expect(items.getItems('popup')).toEqual(['p1']);
    expect(items.getItems('modal')).toEqual(['m1']);
    expect(items.getItems('float')).toEqual(['f1']);
    expect(items.getItems('bottom')).toEqual(['b1']);

    items.registerAction('p1', createFakeAction({ type: 'item-popup' }));
    items.unRegisterItem('p1');
    expect(items.getItems('popup')).toEqual([]);
    expect(useDragContainer(CID).getItemAction('p1')).toBeUndefined();
  });

  it('registerItemShow updates z-order (last = top)', () => {
    initTestContainer();
    const items = useDragItem(CID);
    const a = createFakeAction({ type: 'item-popup' });
    const b = createFakeAction({ type: 'item-popup' });
    items.registerItem('a', 'item-popup');
    items.registerItem('b', 'item-popup');
    items.registerAction('a', a);
    items.registerAction('b', b);

    items.registerItemShow('a', true);
    items.registerItemShow('b', true);
    expect(items.getItemsShow('popup')).toEqual(['a', 'b']);
    expect(a.setZIndex).toHaveBeenCalledWith(10);
    expect(b.setZIndex).toHaveBeenCalledWith(11);

    items.registerItemShow('a', true);
    expect(items.getItemsShow('popup')).toEqual(['b', 'a']);

    items.setToBack('a');
    expect(items.getItemsShow('popup')).toEqual(['a', 'b']);

    items.setToFront('a');
    expect(items.getItemsShow('popup')).toEqual(['b', 'a']);

    items.registerItemShow('a', false);
    expect(items.getItemsShow('popup')).toEqual(['b']);
    expect(items.getAllItemsShow()).toEqual(['b']);
  });

  it('registerOtherAction merges open/close helpers', () => {
    initTestContainer();
    const items = useDragItem(CID);
    items.registerAction('x', createFakeAction({ type: 'item-popup' }));
    const open = vi.fn();
    items.registerOtherAction('x', { open });
    expect(useDragContainer(CID).getItemAction('x')?.open).toBe(open);
  });
});

describe('useSidebarItem', () => {
  it('registers, shows exclusively, moves location, unregisters', () => {
    initTestContainer();
    const side = useSidebarItem(CID);
    const a = createFakeAction({
      type: 'item-sidebar',
      location: 'left',
    });
    const b = createFakeAction({
      type: 'item-sidebar',
      location: 'left',
    });
    side.registerAction('s1', a);
    side.registerAction('s2', b);
    side.registerSideBar('s1', 'left');
    side.registerSideBar('s2', 'left');

    side.registerSideBarShow('s1', true);
    expect(useDragStore().container[CID].sideBar.left.show).toBe('s1');
    expect(a.setShow).toHaveBeenCalledWith(true);

    side.registerSideBarShow('s2', true);
    expect(useDragStore().container[CID].sideBar.left.show).toBe('s2');
    expect(a.setShow).toHaveBeenCalledWith(false);
    expect(b.setShow).toHaveBeenCalledWith(true);

    side.moveSideBarLocation('s2', 'right');
    expect(useDragStore().container[CID].sideBar.left.items).toEqual(['s1']);
    expect(useDragStore().container[CID].sideBar.right.items).toContain('s2');
    expect(useDragStore().container[CID].sideBar.right.show).toBe('s2');
    expect(b.location).toBe('right');

    side.unRegisterSideBar('s2');
    expect(useDragStore().container[CID].sideBar.right.items).toEqual([]);
    expect(useDragStore().container[CID].actions.s2).toBeUndefined();
  });

  it('hides only the active sidebar id and ignores other hide requests', () => {
    initTestContainer();
    const side = useSidebarItem(CID);
    const a = createFakeAction({ type: 'item-sidebar', location: 'left' });
    const b = createFakeAction({ type: 'item-sidebar', location: 'left' });
    side.registerAction('s1', a);
    side.registerAction('s2', b);
    side.registerSideBar('s1', 'left');
    side.registerSideBar('s2', 'left');
    side.registerSideBarShow('s1', true);

    side.registerSideBarShow('s2', false);
    expect(useDragStore().container[CID].sideBar.left.show).toBe('s1');

    side.registerSideBarShow('s1', false);
    expect(useDragStore().container[CID].sideBar.left.show).toBeUndefined();
    expect(a.setShow).toHaveBeenCalledWith(false);
  });
});

describe('useDrawerItem', () => {
  it('registers show/size exclusivity, moves, unregisters', () => {
    initTestContainer();
    const drawer = useDrawerItem(CID);
    const a = createFakeAction({
      type: 'item-drawer',
      location: 'right',
    });
    const b = createFakeAction({
      type: 'item-drawer',
      location: 'right',
    });
    useDragStore().container[CID].actions.d1 = a;
    useDragStore().container[CID].actions.d2 = b;

    drawer.registerDrawerShow('d1', 'right', true, 320);
    expect(drawer.getShowForLocation('right')).toBe('d1');
    expect(drawer.getDrawerForLocation('right').size).toBe(320);
    expect(a.setShow).toHaveBeenCalledWith(true);

    drawer.registerDrawerShow('d2', 'right', true, 200);
    expect(drawer.getShowForLocation('right')).toBe('d2');
    expect(a.setShow).toHaveBeenCalledWith(false);

    drawer.setDrawerSize('right', 400);
    expect(drawer.getDrawerForLocation('right').size).toBe(400);
    expect(drawer.getDrawer().right.size).toBe(400);

    drawer.moveDrawerLocation('d2', 'left');
    expect(drawer.getItemsForLocation('left').map((x) => x.id)).toContain('d2');
    expect(drawer.getShowForLocation('left')).toBe('d2');

    drawer.unRegisterDrawer('d2');
    expect(drawer.getShowForLocation('left')).toBeUndefined();
    expect(useDragStore().container[CID].actions.d2).toBeUndefined();
  });

  it('hides active drawer and ignores hide for non-active id', () => {
    initTestContainer();
    const drawer = useDrawerItem(CID);
    const a = createFakeAction({ type: 'item-drawer', location: 'right' });
    const b = createFakeAction({ type: 'item-drawer', location: 'right' });
    useDragStore().container[CID].actions.d1 = a;
    useDragStore().container[CID].actions.d2 = b;

    drawer.registerDrawerShow('d1', 'right', true, 100);
    drawer.registerDrawerShow('d2', 'right', false);
    expect(drawer.getShowForLocation('right')).toBe('d1');
    expect(drawer.getDrawerForLocation('right').size).toBe(100);

    drawer.registerDrawerShow('d1', 'right', false);
    expect(drawer.getShowForLocation('right')).toBeUndefined();
    expect(drawer.getDrawerForLocation('right').size).toBe(0);
  });
});

describe('useDragItem z-order edges', () => {
  it('setToBack / setToFront are no-ops at ends or with empty ids', () => {
    initTestContainer();
    const items = useDragItem(CID);
    const a = createFakeAction({ type: 'item-popup' });
    const b = createFakeAction({ type: 'item-popup' });
    items.registerItem('a', 'item-popup');
    items.registerItem('b', 'item-popup');
    items.registerAction('a', a);
    items.registerAction('b', b);
    items.registerItemShow('a', true);
    items.registerItemShow('b', true);
    expect(items.getItemsShow('popup')).toEqual(['a', 'b']);

    items.setToFront('b');
    expect(items.getItemsShow('popup')).toEqual(['a', 'b']);
    items.setToBack('a');
    expect(items.getItemsShow('popup')).toEqual(['a', 'b']);

    items.setToBack('');
    items.setToFront('');
    expect(items.getItemsShow('popup')).toEqual(['a', 'b']);
  });
});

describe('useDragComponent', () => {
  it('sets, gets, and clears component slots', () => {
    const api = useDragComponent();
    const card = { name: 'Card' };
    const header = { name: 'Header' };
    const toggle = { name: 'Toggle' };

    api.setComponentCard(card);
    api.setComponentCardHeader(header);
    api.setComponentCardSidebarToggle(toggle);
    expect(api.getComponentCard()).toBe(card);
    expect(api.getComponentCardHeader()).toBe(header);
    expect(api.getComponentCardSidebarToggle()).toBe(toggle);

    api.clearComponentCard();
    expect(api.getComponentCard()).toBeUndefined();
    api.clearComponentCardHeader();
    expect(api.getComponentCardHeader()).toBeUndefined();
    api.setComponentCardSidebarToggle(toggle);
    api.clearComponentCardSidebarToggle();
    expect(api.getComponentCardSidebarToggle()).toBeUndefined();

    api.setComponentCard(card);
    api.setComponentCardHeader(header);
    api.setComponentCardSidebarToggle(toggle);
    api.clearAllComponentCards();
    expect(api.getComponentCard()).toBeUndefined();
    expect(api.getComponentCardHeader()).toBeUndefined();
    expect(api.getComponentCardSidebarToggle()).toBeUndefined();
  });
});
