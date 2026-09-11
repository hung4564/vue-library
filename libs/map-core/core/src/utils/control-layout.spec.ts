import { describe, expect, it } from 'vitest';
import { resolveControlLayout } from './control-layout';

describe('resolveControlLayout', () => {
  it('keeps toolbar and treats button as standalone', () => {
    expect(
      resolveControlLayout('toolbar', {
        buttonInMobile: 'toolbar',
        isMobile: true,
      }),
    ).toBe('toolbar');
    expect(
      resolveControlLayout('button', {
        buttonInMobile: 'menu',
        isMobile: true,
      }),
    ).toBe('standalone');
  });

  it('promotes standalone to toolbar only for buttonInMobile=toolbar on mobile', () => {
    expect(
      resolveControlLayout(undefined, {
        buttonInMobile: 'toolbar',
        isMobile: true,
      }),
    ).toBe('toolbar');
    expect(
      resolveControlLayout('standalone', {
        buttonInMobile: 'toolbar',
        isMobile: false,
      }),
    ).toBe('standalone');
    expect(
      resolveControlLayout('standalone', {
        buttonInMobile: 'button',
        isMobile: true,
      }),
    ).toBe('standalone');
  });

  it('promotes standalone to menu for buttonInMobile=menu on mobile', () => {
    expect(
      resolveControlLayout(undefined, {
        buttonInMobile: 'menu',
        isMobile: true,
      }),
    ).toBe('menu');
    expect(
      resolveControlLayout('standalone', {
        buttonInMobile: 'menu',
        isMobile: true,
      }),
    ).toBe('menu');
    expect(
      resolveControlLayout('standalone', {
        buttonInMobile: 'menu',
        isMobile: false,
      }),
    ).toBe('standalone');
    expect(
      resolveControlLayout('toolbar', {
        buttonInMobile: 'menu',
        isMobile: true,
      }),
    ).toBe('toolbar');
  });
});
