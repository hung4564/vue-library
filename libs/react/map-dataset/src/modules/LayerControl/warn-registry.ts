import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset';
import { UniversalRegistry } from '@hungpvq/react-map-core';

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
    '[LayerControl] Dataset registry UI is not registered. Call createDatasetRegistryPlugin().install() once or layer menus / style / attribute UI will be empty. See @hungpvq/react-map-dataset docs.',
  );
}
