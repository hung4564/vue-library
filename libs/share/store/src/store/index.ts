type GlobalStore = Record<string, unknown>;

// Event emitter for subscriptions
type Listener = () => void;
type ListenersMap = Map<string, Set<Listener>>;

function toPathKey(path: string | string[]): string {
  return Array.isArray(path) ? path.join('.') : path;
}

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
    const pathKey = toPathKey(path);

    // Notify exact path listeners
    const exactListeners = this.listeners.get(pathKey);
    if (exactListeners) {
      exactListeners.forEach((listener) => listener());
    }

    // Notify parent path listeners (string or array paths)
    const parts = pathKey.split('.').filter(Boolean);
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.');
      const parentListeners = this.listeners.get(parentPath);
      if (parentListeners) {
        parentListeners.forEach((listener) => listener());
      }
    }
  }

  /**
   * Subscribe to changes on a specific path
   * Returns an unsubscribe function
   */
  public subscribe(path: string | string[], listener: Listener): () => void {
    const pathKey = toPathKey(path);

    if (!this.listeners.has(pathKey)) {
      this.listeners.set(pathKey, new Set());
    }

    this.listeners.get(pathKey)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(pathKey);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(pathKey);
        }
      }
    };
  }

  public get<T>(path: string | string[]): T | undefined {
    this.updateWindowStore();

    const keys = Array.isArray(path) ? path : [path];
    let current: unknown = this.state;

    for (const key of keys) {
      if (
        typeof current !== 'object' ||
        current === null ||
        !(key in current)
      ) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return current as T;
  }

  public set<T>(keys: string | string[], value: T): T {
    if (typeof keys === 'string') {
      this.state[keys] = value;
    } else if (Array.isArray(keys)) {
      setValueByPath(this.state, keys, value);
    }

    this.updateWindowStore();
    this.notifyListeners(keys);

    return value;
  }

  public has(path: string | string[]): boolean {
    const keys = Array.isArray(path) ? path : [path];
    let current: unknown = this.state;

    for (const key of keys) {
      if (
        typeof current !== 'object' ||
        current === null ||
        !(key in current)
      ) {
        return false;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return true;
  }

  public delete(path: string | string[]): boolean {
    const keys = Array.isArray(path) ? path : [path];
    let current: unknown = this.state;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (
        typeof current !== 'object' ||
        current === null ||
        !(key in current)
      ) {
        return false;
      }
      current = (current as Record<string, unknown>)[key];
    }

    const lastKey = keys[keys.length - 1];
    if (
      typeof current === 'object' &&
      current !== null &&
      lastKey in current
    ) {
      const result = delete (current as Record<string, unknown>)[lastKey];
      this.updateWindowStore();
      this.notifyListeners(path);
      return result;
    }

    return false;
  }
}

function setValueByPath(
  obj: Record<string, unknown>,
  keys: string[],
  value: unknown,
): Record<string, unknown> {
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (i === keys.length - 1) {
      current[key] = value;
    } else {
      const next = current[key];
      if (
        !(key in current) ||
        typeof next !== 'object' ||
        next === null
      ) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
  }
  return current;
}
