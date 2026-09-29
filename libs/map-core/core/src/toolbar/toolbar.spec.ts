import { describe, expect, it, vi } from 'vitest';

import {
  createDefaultToolbarStore,
  createFromFlatButtons,
  createLiveToolbarStrategy,
  createSubscribable,
  createToolbarModuleApi,
  createToolbarStoreApi,
  normalizeToolbarSpec,
} from './index';

describe('toolbar', () => {
  it('createSubscribable notifies subscribers and unsubscribes', () => {
    const { subscribe, notify } = createSubscribable<number>();
    const fn = vi.fn();
    const off = subscribe(fn);
    notify(1);
    expect(fn).toHaveBeenCalledWith(1);
    off();
    notify(2);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('createLiveToolbarStrategy single mounts, syncs, and unmounts', async () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    const onClick = vi.fn();
    const strategy = createLiveToolbarStrategy(
      () => ({
        id: 'home',
        getState: () => ({ title: 'Home', active: false }),
        onClick,
      }),
      toolbar,
    );

    strategy.mount();
    expect(toolbar.get('home')?.title).toBe('Home');

    await strategy.onAction({} as MouseEvent);
    expect(onClick).toHaveBeenCalled();

    strategy.unmount();
    expect(toolbar.get('home')).toBeUndefined();
  });

  it('createFromFlatButtons remounts when button ids change', () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    let ids = ['a'];
    const flat = createFromFlatButtons({
      toolbar,
      getButtons: () =>
        ids.map((id) => ({
          id,
          getState: () => ({ title: id }),
        })),
    });
    flat.mount();
    expect(toolbar.get('a')).toBeDefined();
    ids = ['b'];
    flat.sync();
    expect(toolbar.get('a')).toBeUndefined();
    expect(toolbar.get('b')?.title).toBe('b');
  });

  it('createLiveToolbarStrategy module registers grouped buttons', () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    const strategy = createLiveToolbarStrategy(
      () => ({
        kind: 'module' as const,
        moduleId: 'measure',
        buttons: [
          {
            id: 'distance',
            getState: () => ({ title: 'Distance' }),
            onClick: vi.fn(),
          },
        ],
      }),
      toolbar,
    );
    strategy.mount();
    expect(toolbar.get('measure:distance')?.group).toBe('measure');
    strategy.unmount();
    expect(toolbar.get('measure:distance')).toBeUndefined();
  });

  it('createLiveToolbarStrategy module-expandable stamps launcher and options', () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    const strategy = createLiveToolbarStrategy(
      () => ({
        kind: 'module-expandable' as const,
        moduleId: 'theme',
        closeOnOutsideClick: false,
        expandableButton: ({ active }: { active: boolean }) => ({
          title: 'Theme',
          active,
        }),
        buttons: [{ id: 'dark', getState: () => ({ title: 'Dark' }) }],
      }),
      toolbar,
    );
    strategy.mount();
    expect(toolbar.get('theme:launcher')).toMatchObject({
      role: 'launcher',
      expandable: true,
      closeOnOutsideClick: false,
      active: false,
    });
    expect(toolbar.get('theme:dark')).toMatchObject({
      role: 'option',
      expandable: true,
      group: 'theme',
    });
  });

  it('keeps module button order even when getState omits order', () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    const strategy = createLiveToolbarStrategy(
      () => ({
        kind: 'module' as const,
        moduleId: 'zoom',
        order: 20,
        buttons: [
          { id: 'compass', getState: () => ({ title: 'N', visible: false }) },
          { id: 'in', getState: () => ({ title: 'In' }) },
          { id: 'out', getState: () => ({ title: 'Out' }) },
        ],
      }),
      toolbar,
    );
    strategy.mount();
    expect(toolbar.getAll().map((b) => b.id)).toEqual([
      'zoom:compass',
      'zoom:in',
      'zoom:out',
    ]);
    expect(toolbar.get('zoom:compass')?.order).toBe(20);
    expect(toolbar.get('zoom:in')?.order).toBe(20);
    expect(toolbar.get('zoom:out')?.order).toBe(20);
  });

  it('sorts singles by control order among modules', () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    const home = createLiveToolbarStrategy(
      () => ({
        id: 'home',
        getState: () => ({ title: 'Home', order: 10 }),
      }),
      toolbar,
    );
    const zoom = createLiveToolbarStrategy(
      () => ({
        kind: 'module' as const,
        moduleId: 'zoom',
        order: 20,
        buttons: [{ id: 'in', getState: () => ({ title: 'In' }) }],
      }),
      toolbar,
    );
    const info = createLiveToolbarStrategy(
      () => ({
        id: 'info',
        getState: () => ({ title: 'Info', order: 30 }),
      }),
      toolbar,
    );
    info.mount();
    zoom.mount();
    home.mount();
    expect(toolbar.getAll().map((b) => b.id)).toEqual([
      'home',
      'zoom:in',
      'info',
    ]);
  });

  it('does not reorder getAll when a button is hidden', () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    const strategy = createLiveToolbarStrategy(
      () => ({
        kind: 'module' as const,
        moduleId: 'print',
        order: 5,
        buttons: [
          { id: 'show', getState: () => ({ title: 'Print', visible: false }) },
          { id: 'save', getState: () => ({ title: 'Save', visible: true }) },
          { id: 'close', getState: () => ({ title: 'Close', visible: true }) },
          {
            id: 'setting',
            getState: () => ({ title: 'Setting', visible: true }),
          },
        ],
      }),
      toolbar,
    );
    strategy.mount();
    expect(toolbar.getAll().map((b) => b.id)).toEqual([
      'print:show',
      'print:save',
      'print:close',
      'print:setting',
    ]);
  });

  it('createLiveToolbarStrategy defaults to single kind', () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    const strategy = createLiveToolbarStrategy(
      () => ({
        id: 'btn',
        getState: () => ({ title: 'X' }),
      }),
      toolbar,
    );
    expect(strategy).toHaveProperty('mount');
    expect(strategy).toHaveProperty('id', 'btn');
  });

  it('createLiveToolbarStrategy reads latest options', () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    let title = 'A';
    const strategy = createLiveToolbarStrategy(
      () => ({
        id: 'live',
        getState: () => ({ title }),
      }),
      toolbar,
    );
    strategy.mount();
    expect(store.buttons.get('live')?.title).toBe('A');
    title = 'B';
    strategy.sync();
    expect(store.buttons.get('live')?.title).toBe('B');
  });

  it('createLiveToolbarStrategy mounts module-expandable launcher + options', () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    const onOpt = vi.fn();
    const strategy = createLiveToolbarStrategy(
      () => ({
        kind: 'module-expandable' as const,
        moduleId: 'theme',
        expandableButton: ({ active }: { active: boolean }) => ({
          title: 'Theme',
          active,
        }),
        buttons: [
          {
            id: 'dark',
            getState: () => ({ title: 'Dark' }),
            onClick: onOpt,
          },
        ],
      }),
      toolbar,
      { getExpandedModuleId: () => store.expandedModuleId },
    );
    strategy.mount();
    expect(store.buttons.get('theme:launcher')?.role).toBe('launcher');
    expect(store.buttons.get('theme:launcher')?.expandable).toBe(true);
    expect(store.buttons.get('theme:launcher')?.active).toBe(false);
    expect(store.buttons.get('theme:dark')?.role).toBe('option');

    store.buttons.get('theme:dark')?.action({} as MouseEvent);
    expect(onOpt).toHaveBeenCalled();

    toolbar.toggleExpandedModule('theme');
    strategy.sync();
    expect(store.buttons.get('theme:launcher')?.active).toBe(true);
    toolbar.toggleExpandedModule('theme');
    strategy.sync();
    expect(store.buttons.get('theme:launcher')?.active).toBe(false);
  });

  it('toggleExpandedModule clears when last button of module unregisters', () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    toolbar.register({
      id: 'theme:launcher',
      group: 'theme',
      action: () => undefined,
    });
    toolbar.toggleExpandedModule('theme');
    expect(toolbar.getExpandedModuleId()).toBe('theme');
    toolbar.unregister('theme:launcher');
    expect(toolbar.getExpandedModuleId()).toBeNull();
  });

  it('createToolbarModuleApi registers for toolbar and menu layouts', () => {
    const store = createDefaultToolbarStore();
    let layout: 'standalone' | 'toolbar' | 'menu' | 'button' = 'menu';
    const api = createToolbarModuleApi(store, () => layout);
    api.register({
      id: 'home',
      action: () => undefined,
      title: 'Home',
      position: 'bottom-right',
    });
    expect(store.buttons.get('home')?.position).toBe('bottom-right');

    layout = 'standalone';
    api.update('home', { title: 'Home2' });
    expect(store.buttons.has('home')).toBe(false);

    layout = 'toolbar';
    api.register({
      id: 'home',
      action: () => undefined,
      title: 'Home',
    });
    expect(store.buttons.has('home')).toBe(true);
  });

  it('normalizeToolbarSpec is the author-kind entry used by flat APIs', () => {
    const flat = normalizeToolbarSpec({
      kind: 'module',
      moduleId: 'm',
      buttons: [{ id: 'x', getState: () => ({ title: 'X' }) }],
    });
    expect(flat[0].id).toBe('m:x');
  });
});
