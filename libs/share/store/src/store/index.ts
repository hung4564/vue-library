type GlobalStore = Record<string, unknown>;

// Event emitter for subscriptions
type Listener = () => void;
type ListenersMap = Map<string, Set<Listener>>;

const GLOBAL_STORE_STATE_KEY = '$_hungpv_store';
const GLOBAL_STORE_SERVICE_KEY = '__hungpvq_GlobalStoreService__';

type GlobalStoreHost = typeof globalThis & {
  [GLOBAL_STORE_STATE_KEY]?: GlobalStore;
  [GLOBAL_STORE_SERVICE_KEY]?: GlobalStoreService;
};

function toPathKey(path: string | string[]): string {
  return Array.isArray(path) ? path.join('.') : path;
}

function getHost(): GlobalStoreHost {
  return globalThis as GlobalStoreHost;
}

/**
 * Resolve the shared root bag. Prefer `globalThis` so duplicate bundled copies
 * of this module (Vite optimizeDeps / multiple npm links) still share memory.
 */
function resolveSharedState(): GlobalStore {
  const host = getHost();
  host[GLOBAL_STORE_STATE_KEY] ??= {};
  return host[GLOBAL_STORE_STATE_KEY]!;
}

export class GlobalStoreService {
  private state: GlobalStore;
  private listeners: ListenersMap = new Map();

  private constructor() {
    this.state = resolveSharedState();
  }

  public static getInstance(): GlobalStoreService {
    const host = getHost();
    if (!host[GLOBAL_STORE_SERVICE_KEY]) {
      host[GLOBAL_STORE_SERVICE_KEY] = new GlobalStoreService();
    }
    return host[GLOBAL_STORE_SERVICE_KEY]!;
  }

  public getState(): GlobalStore {
    this.state = resolveSharedState();
    return this.state;
  }

  private syncHostStore() {
    getHost()[GLOBAL_STORE_STATE_KEY] = this.state;
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

    let listeners = this.listeners.get(pathKey);
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(pathKey, listeners);
    }

    listeners.add(listener);

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
    this.state = resolveSharedState();

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
    this.state = resolveSharedState();
    if (typeof keys === 'string') {
      this.state[keys] = value;
    } else if (Array.isArray(keys)) {
      setValueByPath(this.state, keys, value);
    }

    this.syncHostStore();
    this.notifyListeners(keys);

    return value;
  }

  public has(path: string | string[]): boolean {
    this.state = resolveSharedState();
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
    this.state = resolveSharedState();
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
    if (typeof current === 'object' && current !== null && lastKey in current) {
      const result = delete (current as Record<string, unknown>)[lastKey];
      this.syncHostStore();
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
      if (!(key in current) || typeof next !== 'object' || next === null) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
  }
  return current;
}
