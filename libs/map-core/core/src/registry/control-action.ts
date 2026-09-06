import type { MapControlHandle } from './control';

export type ControlActionRunner = (
  mapId: string,
  key: string,
  type?: string,
  event?: unknown,
) => void;

export type ControlGetter = (
  key: string,
  mapId: string,
) => MapControlHandle | undefined;

let controlActionRunner: ControlActionRunner | undefined;

/**
 * Framework layers (Vue/React UniversalRegistry) register this once at module load
 * so core/map-dataset can run control actions without importing UI packages.
 */
export function registerControlActionRunner(fn: ControlActionRunner) {
  controlActionRunner = fn;
}

export function runMapControlAction(
  mapId: string,
  key: string,
  type?: string,
  event?: unknown,
) {
  controlActionRunner?.(mapId, key, type, event);
}
