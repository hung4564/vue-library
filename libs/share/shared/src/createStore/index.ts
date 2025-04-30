type GlobalStore = Record<string, unknown>;

const globalStore: GlobalStore = {};

export function createStore<T>(key: string, store: T): T {
  if (typeof window !== 'undefined') {
    const win = window as Window & { $_hungpv_store?: GlobalStore };
    win.$_hungpv_store ??= {};

    if (win.$_hungpv_store[key]) {
      return win.$_hungpv_store[key] as T;
    }

    win.$_hungpv_store[key] = store;
    return store;
  }

  if (globalStore[key]) {
    return globalStore[key] as T;
  }

  globalStore[key] = store;
  return store;
}
