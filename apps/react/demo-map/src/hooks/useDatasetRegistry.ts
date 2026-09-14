import { createDatasetRegistryPlugin } from '@hungpvq/react-map-dataset';

const registryPlugin = createDatasetRegistryPlugin();

/** Install global dataset registry once (sync). Same as Vue `app.use(createDatasetRegistryPlugin())`. */
function installDatasetRegistry() {
  registryPlugin.install();
}

/** Safe to call from page components; installs sync. */
export function useDatasetRegistry() {
  installDatasetRegistry();
}
