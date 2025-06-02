type GlobalStore = Record<string, unknown>;

export class AppStore {
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
  public get<T>(path: string | string[]): T | undefined {
    this.updateWindowStore();

    const keys = Array.isArray(path) ? path : [path];
    let current: any = this.state;

    for (const key of keys) {
      if (
        typeof current !== 'object' ||
        current === null ||
        !(key in current)
      ) {
        return undefined;
      }
      current = current[key];
    }

    return current as T;
  }

  public set<T>(keys: string | string[], value: T): T {
    if (typeof keys === 'string') {
      this.state[keys] = value;
    } else {
      if (Array.isArray(keys)) {
        setValueByPath(this.state, keys, value);
      }
    }

    this.updateWindowStore();

    return value;
  }
  public has(path: string | string[]): boolean {
    const keys = Array.isArray(path) ? path : [path];
    let current: any = this.state;

    for (const key of keys) {
      if (
        typeof current !== 'object' ||
        current === null ||
        !(key in current)
      ) {
        return false;
      }
      current = current[key];
    }

    return true;
  }

  public delete(path: string | string[]): boolean {
    const keys = Array.isArray(path) ? path : [path];
    let current: any = this.state;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (
        typeof current !== 'object' ||
        current === null ||
        !(key in current)
      ) {
        return false;
      }
      current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    if (typeof current === 'object' && current !== null && lastKey in current) {
      return delete current[lastKey];
    }

    return false;
  }
}
function setValueByPath(
  obj: Record<string, any>,
  keys: string[],
  value: any,
): Record<string, any> {
  let current = obj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (i === keys.length - 1) {
      current[key] = value;
    } else {
      if (
        !(key in current) ||
        typeof current[key] !== 'object' ||
        current[key] === null
      ) {
        current[key] = {};
      }
      current = current[key];
    }
  }
  return current;
}
