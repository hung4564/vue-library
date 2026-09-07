import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ContainerStoreAction } from '../types';
import {
  configureDragStore,
  useDragCommands,
  useDragComponent,
  useDragContainer,
  useDragIsMobile,
  useDragItem,
  useDragLayout,
  useDragStore,
  useDrawerItem,
  useSidebarItem,
  useBottomItem,
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

  it('wraps container map with makeReactive when store factory runs', async () => {
    // Pinia store is a singleton — force a fresh module so makeReactive runs again.
    vi.resetModules();
    const makeReactive = vi.fn(<T extends object>(value: T) => {
      Object.defineProperty(value, '__wrapped', { value: true });
      return value;
    });
    const mod = await import('./index');
    mod.configureDragStore({
      makeReactive,
      notify: () => undefined,
    });
    // First useDragStore() after resetModules invokes the factory.
    const store = mod.useDragStore();
    expect(makeReactive).toHaveBeenCalled();
    expect((store.container as { __wrapped?: boolean }).__wrapped).toBe(true);
    mod.useDragContainer('make-reactive-c').initContainer();
    expect(store.container['make-reactive-c']).toBeTruthy();
    delete store.container['make-reactive-c'];
    // Restore default hooks for the rest of the suite (re-import shared module).
    vi.resetModules();
    const restored = await import('./index');
    restored.configureDragStore({
      notify: () => undefined,
      makeReactive: (value) => value,
    });
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

    expect(items.getItems('popup')).toEqual(['p1']);
    expect(items.getItems('modal')).toEqual(['m1']);
    expect(items.getItems('float')).toEqual(['f1']);
    expect(() => items.registerItem('b1', 'item-bottom')).toThrow(
      /useBottomItem/,
    );

    items.registerAction('p1', createFakeAction({ type: 'item-popup' }));
    items.unRegisterItem('p1');
    expect(items.getItems('popup')).toEqual([]);
    expect(useDragContainer(CID).getItemAction('p1')).toBeUndefined();
  });

  it('does not duplicate id on registerItem', () => {
    initTestContainer();
    const items = useDragItem(CID);
    items.registerItem('p1', 'item-popup');
    items.registerItem('p1', 'item-popup');
    expect(items.getItems('popup')).toEqual(['p1']);
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

  it('getItemShows(group) and getGroup return group snapshots', () => {
    initTestContainer();
    const items = useDragItem(CID);
    items.registerItem('m1', 'item-modal');
    items.registerAction('m1', createFakeAction({ type: 'item-modal' }));
    items.registerItemShow('m1', true);
    expect(useDragContainer(CID).getItemShows('modal')).toEqual(['m1']);
    expect(items.getGroup('modal')).toEqual({ items: ['m1'], show: ['m1'] });
    expect(items.getGroup('float')).toEqual({ items: [], show: [] });
  });

  it('unRegisterItem falls back to group items when action is missing', () => {
    initTestContainer();
    const items = useDragItem(CID);
    items.registerItem('orphan', 'item-float');
    // No registerAction — only items[] membership
    expect(items.getItems('float')).toEqual(['orphan']);
    items.unRegisterItem('orphan');
    expect(items.getItems('float')).toEqual([]);
  });

  it('unRegisterItem clears id from show list', () => {
    initTestContainer();
    const items = useDragItem(CID);
    items.registerItem('p1', 'item-popup');
    items.registerAction('p1', createFakeAction({ type: 'item-popup' }));
    items.registerItemShow('p1', true);
    expect(items.getItemsShow('popup')).toEqual(['p1']);
    items.unRegisterItem('p1');
    expect(items.getItemsShow('popup')).toEqual([]);
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

describe('useDragCommands', () => {
  it('open/close use action helpers and fall back to setShow', () => {
    initTestContainer();
    const items = useDragItem(CID);
    const withHelpers = createFakeAction({ type: 'item-popup' });
    const bare = createFakeAction({
      type: 'item-popup',
      open: undefined,
      close: undefined,
    });
    items.registerItem('a', 'item-popup');
    items.registerItem('b', 'item-popup');
    items.registerAction('a', withHelpers);
    items.registerAction('b', bare);

    const cmds = useDragCommands(CID);
    expect(cmds.getAction('a')).toBe(withHelpers);

    cmds.open('a');
    expect(withHelpers.open).toHaveBeenCalled();
    cmds.close('a');
    expect(withHelpers.close).toHaveBeenCalled();

    cmds.open('b');
    expect(bare.setShow).toHaveBeenCalledWith(true);
    cmds.close('b');
    expect(bare.setShow).toHaveBeenCalledWith(false);
  });

  it('setFront / setBack update z-order', () => {
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

    const cmds = useDragCommands(CID);
    cmds.setBack('b');
    expect(items.getItemsShow('popup')).toEqual(['b', 'a']);
    cmds.setFront('b');
    expect(items.getItemsShow('popup')).toEqual(['a', 'b']);
  });

  it('open/close are no-ops for unknown ids', () => {
    initTestContainer();
    const cmds = useDragCommands(CID);
    expect(() => cmds.open('missing')).not.toThrow();
    expect(() => cmds.close('missing')).not.toThrow();
    expect(cmds.getAction('missing')).toBeUndefined();
  });
});

describe('useDragLayout', () => {
  it('setItemLayout / getItemLayout round-trip bounds', () => {
    initTestContainer();
    const layout = useDragLayout(CID);
    layout.setItemLayout('p1', {
      bounds: { x: 10, y: 20, width: 300, height: 200 },
    });
    expect(layout.getItemLayout('p1')).toEqual({
      bounds: { x: 10, y: 20, width: 300, height: 200 },
    });
  });

  it('getLayout / applyLayout round-trip show + bounds', () => {
    initTestContainer();
    const items = useDragItem(CID);
    const action = createFakeAction({ type: 'item-popup' });
    items.registerItem('p1', 'item-popup');
    items.registerAction('p1', action);
    items.registerItemShow('p1', true);

    const layout = useDragLayout(CID);
    layout.setItemLayout('p1', {
      bounds: { x: 5, y: 15, width: 400, height: 250 },
    });

    const snapshots = layout.getLayout();
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]).toMatchObject({
      id: 'p1',
      type: 'item-popup',
      show: true,
      bounds: { x: 5, y: 15, width: 400, height: 250 },
    });

    items.registerItemShow('p1', false);
    vi.mocked(action.open).mockClear();
    vi.mocked(action.close).mockClear();

    layout.applyLayout([
      {
        id: 'p1',
        type: 'item-popup',
        show: true,
        bounds: { x: 50, y: 60, width: 100, height: 80 },
      },
    ]);

    expect(layout.getItemLayout('p1')?.bounds).toEqual({
      x: 50,
      y: 60,
      width: 100,
      height: 80,
    });
    expect(action.open).toHaveBeenCalled();

    layout.applyLayout([
      {
        id: 'p1',
        type: 'item-popup',
        show: false,
        bounds: { x: 50, y: 60, width: 100, height: 80 },
      },
    ]);
    expect(action.close).toHaveBeenCalled();
  });

  it('getLayout / applyLayout exclusive bottom show', () => {
    initTestContainer();
    const bottom = useBottomItem(CID);
    const a = createFakeAction({ type: 'item-bottom', title: 'A' });
    const b = createFakeAction({ type: 'item-bottom', title: 'B' });
    bottom.registerBottom('a');
    bottom.registerBottom('b');
    bottom.registerAction('a', a);
    bottom.registerAction('b', b);
    bottom.registerBottomShow('a', true);

    const layout = useDragLayout(CID);
    const snapshots = layout.getLayout();
    expect(snapshots.find((s) => s.id === 'a')).toMatchObject({
      type: 'item-bottom',
      show: true,
    });
    expect(snapshots.find((s) => s.id === 'b')).toMatchObject({
      type: 'item-bottom',
      show: false,
    });

    vi.mocked(a.setShow).mockClear();
    vi.mocked(b.setShow).mockClear();
    layout.applyLayout([
      { id: 'a', type: 'item-bottom', show: false },
      { id: 'b', type: 'item-bottom', show: true },
    ]);
    expect(bottom.getShow()).toBe('b');
    expect(a.setShow).toHaveBeenCalledWith(false);
    expect(b.setShow).toHaveBeenCalledWith(true);
  });

  it('getLayout / applyLayout exclusive drawer with size and location move', () => {
    initTestContainer();
    const drawer = useDrawerItem(CID);
    const a = createFakeAction({
      type: 'item-drawer',
      location: 'left',
      title: 'DA',
    });
    const b = createFakeAction({
      type: 'item-drawer',
      location: 'left',
      title: 'DB',
    });
    useDragStore().container[CID].actions.d1 = a;
    useDragStore().container[CID].actions.d2 = b;
    drawer.registerDrawerShow('d1', 'left', true, 240);
    drawer.registerDrawer('d2', 'left');

    const layout = useDragLayout(CID);
    // Live layer size when layouts.size is unset
    expect(layout.getLayout().find((s) => s.id === 'd1')).toMatchObject({
      type: 'item-drawer',
      show: true,
      size: 240,
      location: 'left',
    });
    expect(layout.getLayout().find((s) => s.id === 'd2')).toMatchObject({
      show: false,
    });

    vi.mocked(a.setShow).mockClear();
    vi.mocked(b.setShow).mockClear();
    layout.applyLayout([
      {
        id: 'd1',
        type: 'item-drawer',
        show: false,
        location: 'left',
      },
      {
        id: 'd2',
        type: 'item-drawer',
        show: true,
        location: 'right',
        size: 300,
      },
    ]);
    expect(a.location).toBe('left');
    expect(b.location).toBe('right');
    expect(drawer.getShowForLocation('left')).toBeUndefined();
    expect(drawer.getShowForLocation('right')).toBe('d2');
    expect(drawer.getDrawerForLocation('right').size).toBe(300);
    expect(b.setShow).toHaveBeenCalledWith(true);
  });

  it('getLayout / applyLayout exclusive sidebar with location move', () => {
    initTestContainer();
    const side = useSidebarItem(CID);
    const a = createFakeAction({
      type: 'item-sidebar',
      location: 'left',
      title: 'SA',
    });
    const b = createFakeAction({
      type: 'item-sidebar',
      location: 'left',
      title: 'SB',
    });
    side.registerSideBar('s1', 'left');
    side.registerSideBar('s2', 'left');
    side.registerAction('s1', a);
    side.registerAction('s2', b);
    side.registerSideBarShow('s1', true);

    const layout = useDragLayout(CID);
    expect(layout.getLayout().find((s) => s.id === 's1')).toMatchObject({
      type: 'item-sidebar',
      show: true,
      location: 'left',
    });
    expect(layout.getLayout().find((s) => s.id === 's2')).toMatchObject({
      show: false,
    });

    layout.applyLayout([
      { id: 's1', type: 'item-sidebar', show: false, location: 'left' },
      { id: 's2', type: 'item-sidebar', show: true, location: 'right' },
    ]);
    expect(b.location).toBe('right');
    expect(useDragStore().container[CID].sideBar.left.show).toBeUndefined();
    expect(useDragStore().container[CID].sideBar.right.show).toBe('s2');
  });

  it('applyLayout skips unknown action ids', () => {
    initTestContainer();
    const layout = useDragLayout(CID);
    expect(() =>
      layout.applyLayout([
        { id: 'ghost', type: 'item-popup', show: true },
      ]),
    ).not.toThrow();
  });

  it('getLayout returns empty when container missing', () => {
    expect(useDragLayout(CID).getLayout()).toEqual([]);
    expect(useDragLayout(CID).getItemLayout('x')).toBeUndefined();
  });
});

describe('useBottomItem', () => {
  it('registerBottomShow is exclusive', () => {
    initTestContainer();
    const bottom = useBottomItem(CID);
    const a = createFakeAction({ type: 'item-bottom' });
    const b = createFakeAction({ type: 'item-bottom' });
    bottom.registerBottom('a');
    bottom.registerBottom('b');
    bottom.registerAction('a', a);
    bottom.registerAction('b', b);
    bottom.registerBottomShow('a', true);
    expect(bottom.getShow()).toBe('a');
    expect(a.setShow).toHaveBeenCalledWith(true);
    bottom.registerBottomShow('b', true);
    expect(bottom.getShow()).toBe('b');
    expect(a.setShow).toHaveBeenCalledWith(false);
    expect(b.setShow).toHaveBeenCalledWith(true);
    bottom.registerBottomShow('b', false);
    expect(bottom.getShow()).toBeUndefined();
  });

  it('does not duplicate id on registerBottom', () => {
    initTestContainer();
    const bottom = useBottomItem(CID);
    bottom.registerBottom('a');
    bottom.registerBottom('a');
    expect(bottom.getItems()).toEqual(['a']);
  });

  it('unRegisterBottom clears active show and action', () => {
    initTestContainer();
    const bottom = useBottomItem(CID);
    const a = createFakeAction({ type: 'item-bottom' });
    bottom.registerBottom('a');
    bottom.registerAction('a', a);
    bottom.registerBottomShow('a', true);
    bottom.unRegisterBottom('a');
    expect(bottom.getItems()).toEqual([]);
    expect(bottom.getShow()).toBeUndefined();
    expect(useDragContainer(CID).getItemAction('a')).toBeUndefined();
  });

  it('closing a non-active id is a no-op', () => {
    initTestContainer();
    const bottom = useBottomItem(CID);
    const a = createFakeAction({ type: 'item-bottom' });
    const b = createFakeAction({ type: 'item-bottom' });
    bottom.registerBottom('a');
    bottom.registerBottom('b');
    bottom.registerAction('a', a);
    bottom.registerAction('b', b);
    bottom.registerBottomShow('a', true);
    vi.mocked(a.setShow).mockClear();
    bottom.registerBottomShow('b', false);
    expect(bottom.getShow()).toBe('a');
    expect(a.setShow).not.toHaveBeenCalled();
  });

  it('getAllItemsShow / getItemShows include exclusive bottom id', () => {
    initTestContainer();
    const bottom = useBottomItem(CID);
    const items = useDragItem(CID);
    bottom.registerBottom('bot');
    bottom.registerAction(
      'bot',
      createFakeAction({ type: 'item-bottom', title: 'B' }),
    );
    bottom.registerBottomShow('bot', true);
    items.registerItem('p1', 'item-popup');
    items.registerAction('p1', createFakeAction({ type: 'item-popup' }));
    items.registerItemShow('p1', true);

    expect(items.getAllItemsShow()).toEqual(['p1', 'bot']);
    expect(useDragContainer(CID).getItemShows()).toEqual(['p1', 'bot']);
  });
});
