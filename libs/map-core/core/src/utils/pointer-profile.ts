export type MapPointerProfile = {
  /** True when primary pointer is coarse (typical touch). */
  coarse: boolean;
  /** True when the environment reports hover capability. */
  hoverCapable: boolean;
};

/**
 * Snapshot of pointer/hover media queries for map interaction branching.
 */
export function getMapPointerProfile(
  matchMediaFn:
    ((query: string) => MediaQueryList) | undefined = typeof matchMedia !==
  'undefined'
    ? matchMedia.bind(globalThis)
    : undefined,
): MapPointerProfile {
  if (!matchMediaFn) {
    return { coarse: false, hoverCapable: true };
  }
  const coarse = matchMediaFn('(pointer: coarse)').matches;
  const hoverCapable = matchMediaFn('(hover: hover)').matches;
  return { coarse, hoverCapable };
}
