/**
 * Shared Button variants + sizes (framework-agnostic helpers).
 * Mirrors former MapButton: icon | plain | text | tonal | outlined | filled
 * and small | medium | large | px.
 */
export const UI_BUTTON_VARIANTS = [
  'icon',
  'plain',
  'text',
  'tonal',
  'outlined',
  'filled',
] as const;

export type UiButtonVariant = (typeof UI_BUTTON_VARIANTS)[number];

export const UI_BUTTON_SIZES = ['small', 'medium', 'large'] as const;

export type UiButtonSizeName = (typeof UI_BUTTON_SIZES)[number];

/** Named size or raw pixel box. */
export type UiButtonSize = UiButtonSizeName | number;

export const UI_BUTTON_SIZE_PX: Record<UiButtonSizeName, number> = {
  small: 24,
  medium: 32,
  large: 40,
};

export function isUiButtonVariant(value: string): value is UiButtonVariant {
  return (UI_BUTTON_VARIANTS as readonly string[]).includes(value);
}

export function isUiButtonSizeName(value: string): value is UiButtonSizeName {
  return (UI_BUTTON_SIZES as readonly string[]).includes(value);
}

/** Non-`icon` variants skip a square toolbar wrapper. */
export function isUiButtonFluidVariant(variant: UiButtonVariant): boolean {
  return variant !== 'icon';
}

/** Square hit-area from `size` (`icon` + `plain`). */
export function isUiButtonSquareVariant(variant: UiButtonVariant): boolean {
  return variant === 'icon' || variant === 'plain';
}

export function uiButtonVariantClass(variant: UiButtonVariant): string {
  return variant === 'icon' ? '' : `ui-btn--${variant}`;
}

export function resolveUiButtonSizePx(
  size: UiButtonSize | string | undefined | null,
): number {
  if (size == null || size === '') return UI_BUTTON_SIZE_PX.medium;
  if (typeof size === 'number') {
    return Number.isFinite(size) ? size : UI_BUTTON_SIZE_PX.medium;
  }
  if (isUiButtonSizeName(size)) return UI_BUTTON_SIZE_PX[size];
  const n = Number(size);
  return Number.isFinite(n) ? n : UI_BUTTON_SIZE_PX.medium;
}

/** Named token for CSS class; `null` when custom numeric px. */
export function resolveUiButtonSizeName(
  size: UiButtonSize | string | undefined | null,
): UiButtonSizeName | null {
  if (size == null || size === '') return 'medium';
  if (typeof size === 'number') return null;
  if (isUiButtonSizeName(size)) return size;
  if (/^\d+(\.\d+)?$/.test(size)) return null;
  return 'medium';
}

export function uiButtonSizeClass(
  size: UiButtonSize | string | undefined | null,
): string {
  const name = resolveUiButtonSizeName(size);
  return name ? `ui-btn--size-${name}` : '';
}

export function isUiButtonSize(value: unknown): value is UiButtonSize {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'string') {
    return isUiButtonSizeName(value) || /^\d+(\.\d+)?$/.test(value);
  }
  return false;
}

export function uiButtonBindStyle(
  variant: UiButtonVariant,
  size: UiButtonSize | string | undefined | null,
): Record<string, string> | undefined {
  const sizePx = resolveUiButtonSizePx(size);
  if (isUiButtonSquareVariant(variant)) {
    return { width: `${sizePx}px`, height: `${sizePx}px` };
  }
  if (!uiButtonSizeClass(size)) {
    const pad = Math.round(sizePx / 4);
    return {
      minHeight: `${sizePx}px`,
      paddingLeft: `${pad}px`,
      paddingRight: `${pad}px`,
    };
  }
  return undefined;
}
