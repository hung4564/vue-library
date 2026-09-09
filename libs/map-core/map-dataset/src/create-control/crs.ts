/** CRS helpers for CreateControl mismatch UI (client-only). */

export function normalizeCrsCode(value: string | null | undefined): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/^EPSG:/i, '');
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
