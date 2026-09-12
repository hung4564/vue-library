import { GlobalStoreService } from './index';

describe('GlobalStoreService path keys', () => {
  let store: GlobalStoreService;

  beforeEach(() => {
    // Fresh singleton per test so prior paths/listeners do not leak
    (
      GlobalStoreService as unknown as { instance?: GlobalStoreService }
    ).instance = undefined;
    store = GlobalStoreService.getInstance();
  });

  it('fires listeners when array path subscribe and set use different array instances', () => {
    const listener = jest.fn();
    store.subscribe(['drag', 'containers', 'main'], listener);

    store.set(['drag', 'containers', 'main'], { width: 100 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.get(['drag', 'containers', 'main'])).toEqual({ width: 100 });
  });

  it('notifies parent path listeners for array set paths', () => {
    const parent = jest.fn();
    const exact = jest.fn();
    store.subscribe('drag.containers', parent);
    store.subscribe(['drag', 'containers', 'main'], exact);

    store.set(['drag', 'containers', 'main'], { height: 40 });

    expect(exact).toHaveBeenCalledTimes(1);
    expect(parent).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes using the normalized path key', () => {
    const listener = jest.fn();
    const unsubscribe = store.subscribe(['a', 'b'], listener);

    unsubscribe();
    store.set(['a', 'b'], 1);

    expect(listener).not.toHaveBeenCalled();
  });

  it('supports string path subscribe with string set', () => {
    const listener = jest.fn();
    store.subscribe('root.child', listener);
    store.set('root.child', 'ok');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.get('root.child')).toBe('ok');
  });
});
