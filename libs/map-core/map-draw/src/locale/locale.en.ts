import { DRAW_CONTROL_LOCALE, INSPECT_CONTROL_LOCALE } from './draw.en';

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

/** English catalog for map-draw / inspect UI (mirrors {@link MAP_DRAW_LOCALE_VI}). */
export const MAP_DRAW_LOCALE_EN: Record<string, unknown> = deepMerge(
  DRAW_CONTROL_LOCALE,
  INSPECT_CONTROL_LOCALE,
);
