import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
import { UniversalRegistry } from '@hungpvq/vue-map-core';

let warnedMissingDatasetRegistry = false;

/** @internal test helper */
export function resetDatasetRegistryWarnFlag() {
  warnedMissingDatasetRegistry = false;
}

export function warnIfDatasetRegistryMissing() {
  if (warnedMissingDatasetRegistry) return;
  if (UniversalRegistry.getComponent(LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton)) {
    return;
  }
  warnedMissingDatasetRegistry = true;
  console.warn(
    '[LayerControl] Dataset registry UI is not registered. Call createDatasetRegistryPlugin() once (Vue: app.use(...), React: .install()) or layer menus / style / attribute UI will be empty. See @hungpvq/vue-map-dataset or @hungpvq/react-map-dataset docs.',
  );
}
