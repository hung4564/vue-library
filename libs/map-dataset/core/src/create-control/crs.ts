/** CRS helpers for CreateControl mismatch UI (client-only). */

import { normalizeEpsgCode } from '@hungpvq/map-core/crs';

/** Empty string when {@link normalizeEpsgCode} returns null. */
function toCrsCode(value: string | null | undefined): string {
  return normalizeEpsgCode(value) ?? '';
}

export function isCreateControlCrsMismatch(
  selectedCrs: string | null | undefined,
  detectedCrs: string | null | undefined,
): boolean {
  const selected = toCrsCode(selectedCrs);
  const detected = toCrsCode(detectedCrs);
  if (!selected || !detected) return false;
  return selected !== detected;
}
