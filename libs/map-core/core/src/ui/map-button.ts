/**
 * Shared MapButton / MapControlButton variants + sizes (framework-agnostic).
 * Used by Vue/React map-core adapters — single source of truth.
 *
 * Size: `small` | `medium` | `large` (or numeric px). Applies to every variant.
 */
export const MAP_BUTTON_VARIANTS = [
  'icon',
  'plain',
  'text',
  'tonal',
  'outlined',
  'filled',
] as const;

export type MapButtonVariant = (typeof MAP_BUTTON_VARIANTS)[number];

export const MAP_BUTTON_SIZES = ['small', 'medium', 'large'] as const;

export type MapButtonSizeName = (typeof MAP_BUTTON_SIZES)[number];

/** Named size or raw pixel box (legacy / group). */
export type MapButtonSize = MapButtonSizeName | number;

/** Hit-box / min-height px for named sizes. */
export const MAP_BUTTON_SIZE_PX: Record<MapButtonSizeName, number> = {
  small: 24,
  medium: 32,
  large: 40,
};

export function isMapButtonVariant(value: string): value is MapButtonVariant {
  return (MAP_BUTTON_VARIANTS as readonly string[]).includes(value);
}

export function isMapButtonSizeName(value: string): value is MapButtonSizeName {
  return (MAP_BUTTON_SIZES as readonly string[]).includes(value);
}

/** Non-`icon` variants skip the toolbar `button-container` wrapper. */
export function isMapButtonFluidVariant(variant: MapButtonVariant): boolean {
  return variant !== 'icon';
}

/** Square hit-area from `size` (`icon` + `plain`). */
export function isMapButtonSquareVariant(variant: MapButtonVariant): boolean {
  return variant === 'icon' || variant === 'plain';
}

export function mapButtonVariantClass(variant: MapButtonVariant): string {
  return variant === 'icon' ? '' : `map-control-button--${variant}`;
}

export function resolveMapButtonSizePx(
  size: MapButtonSize | string | undefined | null,
): number {
  if (size == null || size === '') return MAP_BUTTON_SIZE_PX.medium;
  if (typeof size === 'number') {
    return Number.isFinite(size) ? size : MAP_BUTTON_SIZE_PX.medium;
  }
  if (isMapButtonSizeName(size)) return MAP_BUTTON_SIZE_PX[size];
  const n = Number(size);
  return Number.isFinite(n) ? n : MAP_BUTTON_SIZE_PX.medium;
}

/** Named token for CSS class; `null` when custom numeric px. */
export function resolveMapButtonSizeName(
  size: MapButtonSize | string | undefined | null,
): MapButtonSizeName | null {
  if (size == null || size === '') return 'medium';
  if (typeof size === 'number') return null;
  if (isMapButtonSizeName(size)) return size;
  if (/^\d+(\.\d+)?$/.test(size)) return null;
  return 'medium';
}

export function mapButtonSizeClass(
  size: MapButtonSize | string | undefined | null,
): string {
  const name = resolveMapButtonSizeName(size);
  return name ? `map-control-button--size-${name}` : '';
}

export function isMapButtonSize(value: unknown): value is MapButtonSize {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'string') {
    return isMapButtonSizeName(value) || /^\d+(\.\d+)?$/.test(value);
  }
  return false;
}
