import { UniversalRegistry } from './universal-registry';

/** Run a registered control action without importing Vue/React packages. */
export function runMapControlAction(
  mapId: string,
  key: string,
  type?: string,
  event?: unknown,
) {
  UniversalRegistry.runControlAction(mapId, key, type, event);
}
