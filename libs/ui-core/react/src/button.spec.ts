import { describe, expect, it } from 'vitest';

import {
  isUiButtonSize,
  isUiButtonVariant,
  UI_BUTTON_SIZE_PX,
  uiButtonSizeClass,
  uiButtonVariantClass,
  resolveUiButtonSizeName,
  resolveUiButtonSizePx,
} from './ui-button';

describe('ui-button helpers', () => {
  it('resolves named and numeric sizes', () => {
    expect(resolveUiButtonSizePx('small')).toBe(UI_BUTTON_SIZE_PX.small);
    expect(resolveUiButtonSizePx('medium')).toBe(UI_BUTTON_SIZE_PX.medium);
    expect(resolveUiButtonSizePx('large')).toBe(UI_BUTTON_SIZE_PX.large);
    expect(resolveUiButtonSizePx(28)).toBe(28);
    expect(resolveUiButtonSizePx('24')).toBe(24);
    expect(resolveUiButtonSizePx(undefined)).toBe(UI_BUTTON_SIZE_PX.medium);
  });

  it('maps size class for named tokens only', () => {
    expect(uiButtonSizeClass('small')).toBe('ui-btn--size-small');
    expect(uiButtonSizeClass(32)).toBe('');
    expect(resolveUiButtonSizeName(32)).toBeNull();
    expect(resolveUiButtonSizeName('medium')).toBe('medium');
  });

  it('validates variant and size inputs', () => {
    expect(isUiButtonVariant('plain')).toBe(true);
    expect(isUiButtonVariant('nope')).toBe(false);
    expect(isUiButtonSize('large')).toBe(true);
    expect(isUiButtonSize('xxl')).toBe(false);
    expect(uiButtonVariantClass('icon')).toBe('');
    expect(uiButtonVariantClass('filled')).toBe('ui-btn--filled');
  });
});
