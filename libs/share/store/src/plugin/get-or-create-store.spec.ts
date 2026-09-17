import { GlobalStoreService } from '../store';
import { getOrCreateStore } from './index';

const GLOBAL_STORE_STATE_KEY = '$_hungpv_store';
const GLOBAL_STORE_SERVICE_KEY = '__hungpvq_GlobalStoreService__';

function resetSharedStore() {
  const host = globalThis as typeof globalThis & {
    [GLOBAL_STORE_STATE_KEY]?: Record<string, unknown>;
    [GLOBAL_STORE_SERVICE_KEY]?: GlobalStoreService;
  };
  delete host[GLOBAL_STORE_SERVICE_KEY];
  delete host[GLOBAL_STORE_STATE_KEY];
}

describe('getOrCreateStore (SSR / process-wide)', () => {
  beforeEach(() => {
    resetSharedStore();
  });

  it('runs without window (Node / SSR)', () => {
    expect(typeof (globalThis as { window?: unknown }).window).toBe(
      'undefined',
    );
  });

  it('returns the same instance for the same key', () => {
    const a = getOrCreateStore('ssr-probe', () => ({ n: 1 }));
    const b = getOrCreateStore('ssr-probe', () => ({ n: 2 }));
    expect(a).toBe(b);
    expect(a.n).toBe(1);
  });

  it('stores values on globalThis.$_hungpv_store', () => {
    const value = getOrCreateStore('ssr-bag', () => ({ ok: true }));
    const host = globalThis as typeof globalThis & {
      [GLOBAL_STORE_STATE_KEY]?: Record<string, unknown>;
    };
    expect(host[GLOBAL_STORE_STATE_KEY]?.['ssr-bag']).toBe(value);
  });

  it('shares one GlobalStoreService bag across getInstance calls', () => {
    const a = GlobalStoreService.getInstance();
    const b = GlobalStoreService.getInstance();
    expect(a).toBe(b);
    getOrCreateStore('via-factory', () => 42);
    expect(b.get('via-factory')).toBe(42);
  });
});
