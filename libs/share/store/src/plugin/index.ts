import { App } from 'vue';
import { GlobalStoreService } from '../store';
const STORE_KEY = Symbol('@hungpvq/store');
export function createStoreRegistryPlugin() {
  const store = GlobalStoreService.getInstance();

  return {
    install(app: App) {
      app.provide(STORE_KEY, store);
    },
  };
}

export function useStoreRegistry() {
  // FIXME: cần xử lý trường hợp inject
  //const registry = inject<GlobalStoreService>(STORE_KEY) || GlobalStoreService.getInstance();
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
