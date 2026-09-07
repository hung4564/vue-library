import { describe, expect, it, vi } from 'vitest';
import {
  createDefaultToolbarStore,
  createSubscribable,
  createToolbarControl,
  createToolbarModule,
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
});
