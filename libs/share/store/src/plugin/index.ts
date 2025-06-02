import { App, inject } from 'vue';
import { AppStore } from '../store/createStore';
const STORE_KEY = Symbol('@hungpvq/store');
export function createStoreRegistryPlugin() {
  const store = AppStore.getInstance();

  return {
    install(app: App) {
      app.provide(STORE_KEY, store);
    },
  };
}

export function useStoreRegistry() {
  const registry = inject<AppStore>(STORE_KEY) || AppStore.getInstance();
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
