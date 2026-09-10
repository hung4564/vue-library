import { MapInitializer, UniversalRegistry } from '@hungpvq/map-core';
import { Map } from '@hungpvq/react-map-core';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DrawControl } from './modules/DrawControl/DrawControl';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  vi.spyOn(MapInitializer, 'validateWebglSupport').mockImplementation(
    () => undefined,
  );
  vi.spyOn(MapInitializer, 'isWebglSupported').mockReturnValue(true);
  vi.spyOn(MapInitializer, 'setupMapEvents').mockImplementation((map, cb) => {
    if (map && typeof (map as { getStyle?: unknown }).getStyle !== 'function') {
      Object.assign(map, {
        getStyle: () => ({ layers: [], sources: {} }),
        setStyle: () => undefined,
        hasControl: () => false,
        addControl: () => undefined,
        removeControl: () => undefined,
      });
    }
    queueMicrotask(() => cb.onLoad?.(map));
    return () => undefined;
  });
});

const MAP_ID = 'ui-react-map-draw';

afterEach(() => {
  UniversalRegistry.clearMap(MAP_ID);
  vi.restoreAllMocks();
  cleanup();
  document.body.innerHTML = '';
});

describe('DrawControl UI smoke', () => {
  it('registers mapDrawDraftList when DrawControl is mounted', async () => {
    render(
      <Map mapId={MAP_ID}>
        <DrawControl />
      </Map>,
    );

    await waitFor(() =>
      expect(
        UniversalRegistry.getControl('mapDrawDraftList', MAP_ID),
      ).toBeTruthy(),
    );
  });
});
