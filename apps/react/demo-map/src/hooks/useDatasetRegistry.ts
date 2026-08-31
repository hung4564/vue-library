import { createDatasetRegistryPlugin } from '@hungpvq/react-map-dataset';

const registryPlugin = createDatasetRegistryPlugin();

/** Install global dataset registry once (sync). Same as Vue `app.use(createDatasetRegistryPlugin())`. */
export function installDatasetRegistry() {
  registryPlugin.install();
}

/** @deprecated Prefer `installDatasetRegistry()` in app bootstrap. Safe to call; installs sync. */
export function useDatasetRegistry() {
  installDatasetRegistry();
}
