import { describe, expect, it, vi } from 'vitest';
import {
  createDefaultToolbarStore,
  createSubscribable,
  createToolbarControl,
  createToolbarModule,
  createToolbarModuleApi,
  createToolbarStoreApi,
  createToolbarStrategy,
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

  it('createToolbarControl mounts, syncs, and unmounts via toolbar api', async () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    const onClick = vi.fn();
    const control = createToolbarControl({
      id: 'home',
      toolbar,
      getState: () => ({ title: 'Home', active: false }),
      onClick,
    });

    control.mount();
    expect(toolbar.get('home')?.title).toBe('Home');

    await control.onAction({} as MouseEvent);
    expect(onClick).toHaveBeenCalled();

    control.unmount();
    expect(toolbar.get('home')).toBeUndefined();
  });

  it('createToolbarModule registers grouped buttons', () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    const module = createToolbarModule({
      moduleId: 'measure',
      toolbar,
      buttons: [
        {
          id: 'distance',
          getState: () => ({ title: 'Distance' }),
          onClick: vi.fn(),
        },
      ],
    });
    module.mount();
    expect(toolbar.get('measure:distance')?.group).toBe('measure');
    module.unmount();
    expect(toolbar.get('measure:distance')).toBeUndefined();
  });

  it('keeps module button order even when getState omits order', () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    const module = createToolbarModule({
      moduleId: 'zoom',
      order: 20,
      toolbar,
      buttons: [
        { id: 'compass', getState: () => ({ title: 'N', visible: false }) },
        { id: 'in', getState: () => ({ title: 'In' }) },
        { id: 'out', getState: () => ({ title: 'Out' }) },
      ],
    });
    module.mount();
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
    const home = createToolbarControl({
      id: 'home',
      toolbar,
      getState: () => ({ title: 'Home', order: 10 }),
    });
    const zoom = createToolbarModule({
      moduleId: 'zoom',
      order: 20,
      toolbar,
      buttons: [{ id: 'in', getState: () => ({ title: 'In' }) }],
    });
    const info = createToolbarControl({
      id: 'info',
      toolbar,
      getState: () => ({ title: 'Info', order: 30 }),
    });
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
    const module = createToolbarModule({
      moduleId: 'print',
      order: 5,
      toolbar,
      buttons: [
        { id: 'show', getState: () => ({ title: 'Print', visible: false }) },
        { id: 'save', getState: () => ({ title: 'Save', visible: true }) },
        { id: 'close', getState: () => ({ title: 'Close', visible: true }) },
        { id: 'setting', getState: () => ({ title: 'Setting', visible: true }) },
      ],
    });
    module.mount();
    expect(toolbar.getAll().map((b) => b.id)).toEqual([
      'print:show',
      'print:save',
      'print:close',
      'print:setting',
    ]);
  });

  it('createToolbarStrategy defaults to single kind', () => {
    const store = createDefaultToolbarStore();
    const toolbar = createToolbarStoreApi(store);
    const strategy = createToolbarStrategy({
      id: 'btn',
      toolbar,
      getState: () => ({ title: 'X' }),
    });
    expect(strategy).toHaveProperty('mount');
    expect(strategy).toHaveProperty('id', 'btn');
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
});
