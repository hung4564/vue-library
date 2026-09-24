/**
 * Root barrel for `@hungpvq/shared-store` — named exports (Stable).
 * React hooks live on `@hungpvq/shared-store/react`.
 */
export {
  createStoreRegistryPlugin,
  defineStore,
  getOrCreateStore,
  useStoreRegistry,
} from './plugin';
export { GlobalStoreService } from './store';
