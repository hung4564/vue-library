/**
 * Per-async-chain context storage (zone), not a sticky module-level bag.
 *
 * Node: AsyncLocalStorage when available (true concurrent isolation).
 * Browser: nest + keep `current` until the Promise returned from `run`
 * settles. Nested `run` calls restore the parent store on settle.
 *
 * Note: browser sticky mode cannot isolate two overlapping top-level
 * `run` chains (Promise.all); Node ALS can. Promise.prototype.then is
 * not patched — modern V8 `await` bypasses it.
 */

export type ZoneContextStorage<T> = {
  run<R>(store: T, fn: () => R): R;
  getStore(): T | undefined;
};

function isPromiseLike<T>(
  value: T | PromiseLike<T>,
): value is PromiseLike<T> {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof (value as PromiseLike<T>).then === 'function'
  );
}

function createBrowserZoneStorage<T>(): ZoneContextStorage<T> {
  /** Active zone for the current sync turn / unsettled browser run. */
  let current: T | undefined;

  return {
    run<R>(store: T, fn: () => R): R {
      const prev = current;
      current = store;
      let result: R;
      try {
        result = fn();
      } catch (err) {
        current = prev;
        throw err;
      }

      if (!isPromiseLike(result)) {
        current = prev;
        return result;
      }

      // Leave `current === store` so `await` continuations inside `fn` still
      // see this zone (V8 does not call Promise.prototype.then for await).
      return Promise.resolve(result).then(
        (value) => {
          current = prev;
          return value as R;
        },
        (err) => {
          current = prev;
          throw err;
        },
      ) as R;
    },
    getStore: () => current,
  };
}

function createNodeZoneStorage<T>(): ZoneContextStorage<T> | undefined {
  try {
    if (
      typeof process === 'undefined' ||
      !(process as { versions?: { node?: string } }).versions?.node
    ) {
      return undefined;
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- Node-only ALS; keep sync for zone bootstrap
    const mod = require('async_hooks') as typeof import('async_hooks');
    if (!mod?.AsyncLocalStorage) return undefined;
    const als = new mod.AsyncLocalStorage<T>();
    return {
      run<R>(store: T, fn: () => R): R {
        return als.run(store, fn);
      },
      getStore() {
        return als.getStore();
      },
    };
  } catch {
    return undefined;
  }
}

let sharedStorage: ZoneContextStorage<unknown> | undefined;
let browserReset: (() => void) | undefined;
/** When true, skip Node ALS and always use browser sticky zone (tests). */
let forceBrowserForTests = false;

function installBrowserStorage() {
  const browser = createBrowserZoneStorage<unknown>();
  sharedStorage = browser;
  browserReset = () => {
    // Drop singleton only — do not allocate a replacement (avoids orphan stores).
    sharedStorage = undefined;
  };
}

/** Process-wide zone storage (lazy). */
export function getLogZoneStorage<T>(): ZoneContextStorage<T> {
  if (!sharedStorage) {
    if (!forceBrowserForTests) {
      const node = createNodeZoneStorage<unknown>();
      if (node) {
        sharedStorage = node;
        return sharedStorage as ZoneContextStorage<T>;
      }
    }
    installBrowserStorage();
  }
  return sharedStorage as ZoneContextStorage<T>;
}

/** Test helper — clear process singleton / browser nest pointer. */
export function resetZoneContextStorageForTests() {
  if (browserReset) {
    browserReset();
  }
  sharedStorage = undefined;
  browserReset = undefined;
  forceBrowserForTests = false;
}

/**
 * Test helper — next {@link getLogZoneStorage} uses browser sticky zone
 * even under Node (so ALS does not mask browser bugs).
 */
export function useBrowserZoneStorageForTests() {
  resetZoneContextStorageForTests();
  forceBrowserForTests = true;
  installBrowserStorage();
}
