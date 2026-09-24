/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { MapControlHandle } from '../registry/control';
import { UniversalRegistry } from '../registry/universal-registry';
import {
  bindMapKeyboardShortcuts,
  focusMapLayerSearch,
  mapLayerSearchSelector,
} from './map-keyboard';

function fakeControl(
  id: string,
  overrides: Partial<MapControlHandle> = {},
): MapControlHandle {
  return {
    id,
    panelKind: 'popup',
    props: {},
    actions: [],
    isOpen: () => false,
    open: () => undefined,
    close: () => undefined,
    toggle: () => undefined,
    setShow: () => undefined,
    getPanelPosition: () => ({}),
    setPanelPosition: () => undefined,
    runAction: () => undefined,
    ...overrides,
  };
}

function mountSearch(mapId: string, value = mapId) {
  const input = document.createElement('input');
  input.setAttribute('data-map-layer-search', '');
  input.setAttribute('data-map-id', mapId);
  input.value = value;
  document.body.appendChild(input);
  return input;
}

describe('map-keyboard multi-map', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    UniversalRegistry.clearMap('map-a');
    UniversalRegistry.clearMap('map-b');
    vi.restoreAllMocks();
  });

  it('builds a map-scoped search selector', () => {
    expect(mapLayerSearchSelector('map-a')).toBe(
      '[data-map-layer-search][data-map-id="map-a"]',
    );
  });

  it('focuses only the search for the given mapId', () => {
    const a = mountSearch('map-a');
    const b = mountSearch('map-b');
    UniversalRegistry.registerControl(
      'map-a',
      'mapLayerControl',
      fakeControl('mapLayerControl', { isOpen: () => true }),
    );

    expect(focusMapLayerSearch('map-a')).toBe(true);
    expect(document.activeElement).toBe(a);
    expect(document.activeElement).not.toBe(b);
  });

  it('slash shortcut focuses the bound map search, not another map', () => {
    const a = mountSearch('map-a');
    mountSearch('map-b');
    UniversalRegistry.registerControl(
      'map-a',
      'mapLayerControl',
      fakeControl('mapLayerControl', { isOpen: () => true }),
    );
    const unbind = bindMapKeyboardShortcuts({ mapId: 'map-a' });

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: '/', bubbles: true }),
    );

    expect(document.activeElement).toBe(a);
    unbind();
  });
});
