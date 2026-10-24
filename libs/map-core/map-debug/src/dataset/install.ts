import { addClearFunctionLog } from '../core/map-debug-store';
import { clearDatasetDebug, initDatasetDebug } from './bridge';
import { installDatasetDebugMenus } from './menu-debug-item';

export function installDatasetDebug() {
  initDatasetDebug();
  addClearFunctionLog(installDatasetDebugMenus());
  addClearFunctionLog(clearDatasetDebug);
}
