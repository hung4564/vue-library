import {
  DRAW_CONTROL_LOCALE_VI,
  INSPECT_CONTROL_LOCALE_VI,
} from './draw.vi';

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = out[key];
    if (
      sv &&
      typeof sv === 'object' &&
      !Array.isArray(sv) &&
      tv &&
      typeof tv === 'object' &&
      !Array.isArray(tv)
    ) {
      out[key] = deepMerge(
        tv as Record<string, unknown>,
        sv as Record<string, unknown>,
      );
    } else {
      out[key] = sv;
    }
  }
  return out;
}

/** Vietnamese catalog for map-draw / inspect UI (mirrors {@link MAP_DRAW_LOCALE_EN}). */
export const MAP_DRAW_LOCALE_VI: Record<string, unknown> = deepMerge(
  DRAW_CONTROL_LOCALE_VI,
  INSPECT_CONTROL_LOCALE_VI,
);
