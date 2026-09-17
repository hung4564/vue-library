/**
 * Pure MeasurementControl toolbar / mode helpers (Vue ↔ React parity).
 * Measure classes + MeasurementHandle stay the SoT for geometry work.
 */

export type MeasurementToolbarStatus = 'select' | 'handle';

/**
 * Toolbar phase: tool picker vs active-measure actions.
 */
export function resolveMeasurementToolbarStatus(
  measurementType: string | undefined,
): MeasurementToolbarStatus {
  return measurementType ? 'handle' : 'select';
}

export type MeasurementModeToggleResult =
  | { start: false; nextType: undefined }
  | { start: true; nextType: string };

/**
 * Toggle / switch measure mode. Same type again → clear; otherwise start that type.
 * Callers still `reset(false)` before applying the result.
 */
export function resolveMeasurementModeToggle(
  currentType: string | undefined,
  nextType: string,
): MeasurementModeToggleResult {
  if (currentType === nextType) {
    return { start: false, nextType: undefined };
  }
  return { start: true, nextType };
}
