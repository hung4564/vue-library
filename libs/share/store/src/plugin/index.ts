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
export function defineStore<T>(
  id: string | string[],
  setup: StoreDefinition<T>,
): () => T {
  return function useStore(): T {
    const storeRegistry = useStoreRegistry();
    if (!storeRegistry.has(id)) {
      const store = setup();
      storeRegistry.set(id, store);
    }
    return storeRegistry.get(id) as T;
  };
}
