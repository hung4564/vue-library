export function createStore<T>(key: string, store: T): T {
  const win = window as any;
  if (!win.$_hungpv_store) {
    win.$_hungpv_store = {};
  }
  if (win.$_hungpv_store[key]) {
    store = win.$_hungpv_store[key];
  } else {
    win.$_hungpv_store[key] = store;
  }
  return store;
}
