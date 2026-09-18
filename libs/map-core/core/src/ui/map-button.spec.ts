import { describe, expect, it } from 'vitest';
import {
  isMapButtonSize,
  isMapButtonVariant,
  mapButtonSizeClass,
  mapButtonVariantClass,
  MAP_BUTTON_SIZE_PX,
  resolveMapButtonSizeName,
  resolveMapButtonSizePx,
} from './map-button';

describe('map-button helpers', () => {
  it('resolves named and numeric sizes', () => {
    expect(resolveMapButtonSizePx('small')).toBe(MAP_BUTTON_SIZE_PX.small);
    expect(resolveMapButtonSizePx('medium')).toBe(MAP_BUTTON_SIZE_PX.medium);
    expect(resolveMapButtonSizePx('large')).toBe(MAP_BUTTON_SIZE_PX.large);
    expect(resolveMapButtonSizePx(28)).toBe(28);
    expect(resolveMapButtonSizePx('24')).toBe(24);
    expect(resolveMapButtonSizePx(undefined)).toBe(MAP_BUTTON_SIZE_PX.medium);
  });

  it('maps size class for named tokens only', () => {
    expect(mapButtonSizeClass('small')).toBe('map-control-button--size-small');
    expect(mapButtonSizeClass(32)).toBe('');
    expect(resolveMapButtonSizeName(32)).toBeNull();
    expect(resolveMapButtonSizeName('medium')).toBe('medium');
  });

  it('validates variant and size inputs', () => {
    expect(isMapButtonVariant('plain')).toBe(true);
    expect(isMapButtonVariant('nope')).toBe(false);
    expect(isMapButtonSize('large')).toBe(true);
    expect(isMapButtonSize('xxl')).toBe(false);
    expect(mapButtonVariantClass('icon')).toBe('');
    expect(mapButtonVariantClass('filled')).toBe('map-control-button--filled');
  });
});
