/** Layer list search helpers (client-only). */

export function normalizeLayerSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function layerNameMatchesSearch(
  name: string | undefined | null,
  query: string,
): boolean {
  const q = normalizeLayerSearchQuery(query);
  if (!q) return true;
  return String(name ?? '')
    .toLowerCase()
    .includes(q);
}

/**
 * Split a display name into plain / match segments for highlight rendering.
 */
export function splitSearchHighlight(
  text: string,
  query: string,
): Array<{ text: string; match: boolean }> {
  const raw = String(text ?? '');
  const q = query.trim();
  if (!q) return [{ text: raw, match: false }];
  const lower = raw.toLowerCase();
  const needle = q.toLowerCase();
  const index = lower.indexOf(needle);
  if (index < 0) return [{ text: raw, match: false }];
  const parts: Array<{ text: string; match: boolean }> = [];
  if (index > 0) parts.push({ text: raw.slice(0, index), match: false });
  parts.push({ text: raw.slice(index, index + q.length), match: true });
  if (index + q.length < raw.length) {
    parts.push({ text: raw.slice(index + q.length), match: false });
  }
  return parts;
}
