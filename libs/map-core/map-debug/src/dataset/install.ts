import { addClearFunctionLog } from '../core/store-core';
import { clearDatasetDebug, initDatasetDebug } from './bridge';
import { getMapDebugStore } from './map-debug-store';
import { installDatasetDebugMenus } from './menu-debug-item';

export function installDatasetDebug() {
  getMapDebugStore().state.installedDataset = true;
  initDatasetDebug();
  addClearFunctionLog(installDatasetDebugMenus());
  addClearFunctionLog(clearDatasetDebug);
}
