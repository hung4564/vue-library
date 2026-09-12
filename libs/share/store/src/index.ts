/**
 * Root barrel for `@hungpvq/shared-store` — named exports (Stable).
 * React hooks live on `@hungpvq/shared-store/react`.
 */
export { GlobalStoreService } from './store';
export {
  createStoreRegistryPlugin,
  defineStore,
  useStoreRegistry,
} from './plugin';
