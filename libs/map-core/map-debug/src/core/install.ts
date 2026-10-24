import { setMapDevtoolsInstalled } from './map-debug-store';

/** @deprecated Use isMapDevtoolsInstalled from map-debug-store. */
export { isMapDevtoolsInstalled } from './map-debug-store';

/** Mark map Devtools lifecycle as installed (called by vue/react-map-devtools). */
export function markMapDevtoolsInstalled(installed: boolean): void {
  setMapDevtoolsInstalled(installed);
}
