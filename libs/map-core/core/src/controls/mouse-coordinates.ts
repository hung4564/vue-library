import type { MapSimple } from '../types';

/** Local debounce (avoids lodash dependency). */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  waitMs: number,
): (...args: TArgs) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: TArgs) => {
    if (timer != null) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
}

function getDecimalRoundNum(d: number): number {
  const multiplier = Math.pow(10, Math.ceil(-Math.log(d) / Math.LN10));
  return Math.round(d * multiplier) / multiplier;
}

export function getRoundNum(num: number): number {
  const pow10 = Math.pow(10, `${Math.floor(num)}`.length - 1);
  let d = num / pow10;

  d =
    d >= 10
      ? 10
      : d >= 5
        ? 5
        : d >= 3
          ? 3
          : d >= 2
            ? 2
            : d >= 1
              ? 1
              : getDecimalRoundNum(d);

  return pow10 * d;
}

export function formatMapScaleLabel(
  map: MapSimple,
  maxWidthPx = 100,
): string | undefined {
  const y = map.getContainer().clientHeight / 2;
  const left = map.unproject([0, y]);
  const right = map.unproject([maxWidthPx, y]);
  const maxMeters = left.distanceTo(right);
  if (maxMeters >= 1000) {
    return `${getRoundNum(maxMeters / 1000)}\u00A0km`;
  }
  return `${getRoundNum(maxMeters)}\u00A0m`;
}

export function applyMapScaleLabel(
  map: MapSimple,
  container: HTMLElement | null | undefined,
  maxWidthPx = 100,
): void {
  if (!container) return;
  const label = formatMapScaleLabel(map, maxWidthPx);
  if (label != null) container.textContent = label;
}
