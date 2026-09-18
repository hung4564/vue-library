import { GlobalStoreService } from '../store';
const STORE_KEY = Symbol('@hungpvq/store');
export function createStoreRegistryPlugin() {
  const store = GlobalStoreService.getInstance();

  return {
    install(app: any) {
      app.provide(STORE_KEY, store);
    },
  };
}

export function useStoreRegistry() {
  // Inject deferred: always use singleton until inject(STORE_KEY) is wired.
  const registry = GlobalStoreService.getInstance();
  if (!registry)
    throw new Error(
      'Store registry not found. Did you forget to app.use(createStoreRegistryPlugin())?',
    );
  return registry;
}

type StoreDefinition<T = any> = () => T;

/**
 * Lazy store factory by id/path. Returns a getter that creates the value once
 * in {@link GlobalStoreService} (shared across package copies via globalThis).
 */
export function defineStore<T>(
  id: string | string[],
  setup: StoreDefinition<T>,
): () => T {
  return function useStore(): T {
    return getOrCreateStore(id, setup);
  };
}

/**
 * Eager get-or-create for non-hook contexts (class statics, services).
 * Same backing store as {@link defineStore}.
 */
export function getOrCreateStore<T>(
  id: string | string[],
  setup: StoreDefinition<T>,
): T {
  const storeRegistry = useStoreRegistry();
  if (!storeRegistry.has(id)) {
    const store = setup();
    storeRegistry.set(id, store);
  }
  return storeRegistry.get(id) as T;
}

