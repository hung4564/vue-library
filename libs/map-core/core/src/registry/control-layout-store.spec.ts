import { afterEach, describe, expect, it, vi } from 'vitest';

import { getMapCoreRootStore } from '../store/map-core-meta';
import { MAP_STORE_KEY } from '../types/constants';
import {
  clearControlLayoutsForMap,
  ensureControlLayout,
  getControlLayout,
  type MapControlLayoutStore,
  removeControlLayout,
  resolveEffectiveButtonInMobile,
  setControlLayout,
  subscribeControlLayout,
} from './control-layout-store';

describe('control-layout-store', () => {
  afterEach(() => {
    clearControlLayoutsForMap('m1');
  });

  it('ensure seeds defaults once on map:core', () => {
    const a = ensureControlLayout('m1', 'home', {
      position: 'top-left',
      order: 10,
    });
    expect(a).toMatchObject({
      visible: true,
      position: 'top-left',
      order: 10,
      controlLayout: 'standalone',
    });
    ensureControlLayout('m1', 'home', { order: 99 });
    expect(getControlLayout('m1', 'home')?.order).toBe(10);
    const bag = getMapCoreRootStore()['m1']?.[
      MAP_STORE_KEY.CONTROL_LAYOUT
    ] as MapControlLayoutStore;
    expect(bag.byId.home?.order).toBe(10);
  });

  it('setControlLayout patches and notifies', () => {
    ensureControlLayout('m1', 'home');
    const spy = vi.fn();
    const unsub = subscribeControlLayout(spy);
    setControlLayout('m1', 'home', {
      visible: false,
      controlLayout: 'toolbar',
      buttonInMobile: 'button',
    });
    expect(getControlLayout('m1', 'home')).toMatchObject({
      visible: false,
      controlLayout: 'toolbar',
      buttonInMobile: 'button',
    });
    expect(spy).toHaveBeenCalledWith('m1', 'home');
    unsub();
  });

  it('buttonInMobile undefined clears override (inherit)', () => {
    ensureControlLayout('m1', 'home', { buttonInMobile: 'toolbar' });
    setControlLayout('m1', 'home', { buttonInMobile: undefined });
    expect(getControlLayout('m1', 'home')?.buttonInMobile).toBeUndefined();
  });

  it('remove and clearMap drop entries', () => {
    ensureControlLayout('m1', 'home');
    ensureControlLayout('m1', 'goto');
    removeControlLayout('m1', 'home');
    expect(getControlLayout('m1', 'home')).toBeUndefined();
    expect(getControlLayout('m1', 'goto')).toBeTruthy();
    clearControlLayoutsForMap('m1');
    expect(getControlLayout('m1', 'goto')).toBeUndefined();
  });

  it('resolveEffectiveButtonInMobile prefers control override', () => {
    expect(resolveEffectiveButtonInMobile(undefined, 'toolbar')).toBe(
      'toolbar',
    );
    expect(resolveEffectiveButtonInMobile('button', 'toolbar')).toBe('button');
    expect(
      resolveEffectiveButtonInMobile(undefined, undefined),
    ).toBeUndefined();
  });
});
