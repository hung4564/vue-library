/** GeoJSON bbox `[minLng, minLat, maxLng, maxLat]` — at least four finite numbers. */
export function isValidBbox(
  bbox: unknown,
): bbox is [number, number, number, number] {
  return (
    Array.isArray(bbox) &&
    bbox.length >= 4 &&
    bbox.slice(0, 4).every((n) => typeof n === 'number' && Number.isFinite(n))
  );
}
