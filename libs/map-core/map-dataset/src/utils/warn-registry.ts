import { loggerFactory } from '@hungpvq/shared-log';
import { logger } from '../logger';
import { LIST_VIEW_MENU_COMPONENT_KEY } from '../menu/items';

let warnedMissingDatasetRegistry = false;

/** @internal test helper */
export function resetDatasetRegistryWarnFlag() {
  warnedMissingDatasetRegistry = false;
}

/**
 * Warn once when dataset registry UI components are not registered.
 * Adapters pass their `UniversalRegistry.getComponent` and package label
 * (`vue-map-dataset` / `react-map-dataset`).
 *
 * Always emits (setup error) even when shared-log namespaces are disabled.
 */
export function warnIfDatasetRegistryMissing(
  getComponent: (key: string) => unknown,
  packageLabel: string,
) {
  if (warnedMissingDatasetRegistry) return;
  if (getComponent(LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton)) {
    return;
  }
  warnedMissingDatasetRegistry = true;
  const installHint =
    packageLabel === 'vue-map-dataset'
      ? 'installMapApp(app)'
      : 'installMapApp()';
  const message = `[LayerControl] Dataset registry UI is not registered. Call ${installHint} once (or createDatasetRegistryPlugin) or layer menus / style / attribute UI will be empty. See @hungpvq/${packageLabel} docs.`;

  const adapters = loggerFactory.getAdapters();
  const previousAlwaysOn = adapters.map((adapter) => adapter.alwaysOn);
  for (const adapter of adapters) {
    adapter.alwaysOn = true;
  }
  try {
    logger
      .with({ fn: 'warnIfDatasetRegistryMissing', span: 'validation' })
      .warn(message);
  } finally {
    adapters.forEach((adapter, index) => {
      adapter.alwaysOn = previousAlwaysOn[index];
    });
  }
}
