type GlobalStore = Record<string, unknown>;

class AppStore {
  private static instance: AppStore;
  private state: GlobalStore = {};
  private constructor() {
    if (typeof window !== 'undefined') {
      const win = window as Window & { $_hungpv_store?: GlobalStore };
      win.$_hungpv_store ??= {};
      this.state = win.$_hungpv_store;
    } else {
      this.state = {};
    }
  }
  public static getInstance(): AppStore {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore();
    }
    return AppStore.instance;
  }

  public getState(): GlobalStore {
    return this.state;
  }
  private updateWindowStore() {
    if (typeof window !== 'undefined') {
      const win = window as Window & { $_hungpv_store?: GlobalStore };
      win.$_hungpv_store = this.state;
    }
  }
  public get<T>(key: string): T | undefined {
    this.updateWindowStore();
    return this.state[key] as T;
  }

  public set<T>(key: string, value: T): T {
    this.state[key] = value;

    this.updateWindowStore();

    return value;
  }
  public has(key: string): boolean {
    return key in this.state;
  }

  public delete(key: string): boolean {
    return delete this.state[key];
  }
}
type StoreKey<T> = string & { __type?: T }; // dùng cho autocompletion về sau
export function createStore<T>(key: StoreKey<T>, store: T): T {
  const appStore = AppStore.getInstance();
  return appStore.get<T>(key) ?? appStore.set<T>(key, store);
}
