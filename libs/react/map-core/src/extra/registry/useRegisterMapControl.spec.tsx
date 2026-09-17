import { UniversalRegistry } from '@hungpvq/map-core';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useRegisterMapControl } from './useRegisterMapControl';

const MAP_ID = 'react-register-control';

afterEach(() => {
  UniversalRegistry.clearMap(MAP_ID);
  cleanup();
});

function Host() {
  useRegisterMapControl(MAP_ID, {
    id: 'demo-control',
    panelKind: 'button',
    title: 'Demo',
    show: false,
    setShow: () => undefined,
  });
  return null;
}

describe('useRegisterMapControl', () => {
  it('unregisters on unmount without throwing', () => {
    const { unmount } = render(<Host />);
    expect(UniversalRegistry.getControl('demo-control', MAP_ID)).toBeTruthy();
    expect(() => unmount()).not.toThrow();
    expect(
      UniversalRegistry.getControl('demo-control', MAP_ID),
    ).toBeUndefined();
  });
});
