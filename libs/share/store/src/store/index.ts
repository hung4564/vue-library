type GlobalStore = Record<string, unknown>;

// Event emitter for subscriptions
type Listener = () => void;
type ListenersMap = Map<string | string[], Set<Listener>>;

export class GlobalStoreService {
  private static instance: GlobalStoreService;
  private state: GlobalStore = {};
  private listeners: ListenersMap = new Map();

  private constructor() {
    if (typeof window !== 'undefined') {
      const win = window as Window & { $_hungpv_store?: GlobalStore };
      win.$_hungpv_store ??= {};
      this.state = win.$_hungpv_store;
    } else {
      this.state = {};
    }
  }

  public static getInstance(): GlobalStoreService {
    if (!GlobalStoreService.instance) {
      GlobalStoreService.instance = new GlobalStoreService();
    }
    return GlobalStoreService.instance;
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

  private notifyListeners(path: string | string[]) {
    const pathKey = Array.isArray(path) ? path.join('.') : path;

    // Notify exact path listeners
    const exactListeners = this.listeners.get(path);
    if (exactListeners) {
      exactListeners.forEach((listener) => listener());
    }

    // Notify parent path listeners
    if (typeof path === 'string') {
      const parts = path.split('.');
      for (let i = parts.length - 1; i > 0; i--) {
        const parentPath = parts.slice(0, i).join('.');
        const parentListeners = this.listeners.get(parentPath);
        if (parentListeners) {
          parentListeners.forEach((listener) => listener());
        }
      }
    }
  }

  /**
   * Subscribe to changes on a specific path
   * Returns an unsubscribe function
   */
  public subscribe(path: string | string[], listener: Listener): () => void {
    const pathKey = Array.isArray(path) ? path.join('.') : path;

    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }

    this.listeners.get(path)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(path);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(path);
        }
      }
    };
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
    this.notifyListeners(keys);

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
      const result = delete current[lastKey];
      this.updateWindowStore();
      this.notifyListeners(path);
      return result;
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
