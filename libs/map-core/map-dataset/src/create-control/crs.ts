/** CRS helpers for CreateControl mismatch UI (client-only). */

import { normalizeEpsgCode } from '@hungpvq/map-core/crs';

/** Thin wrapper: empty string when {@link normalizeEpsgCode} returns null. */
export function normalizeCrsCode(value: string | null | undefined): string {
  return normalizeEpsgCode(value) ?? '';
}

export function isCreateControlCrsMismatch(
  selectedCrs: string | null | undefined,
  detectedCrs: string | null | undefined,
): boolean {
  const selected = normalizeCrsCode(selectedCrs);
  const detected = normalizeCrsCode(detectedCrs);
  if (!selected || !detected) return false;
  return selected !== detected;
}
