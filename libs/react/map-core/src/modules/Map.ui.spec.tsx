import { MapInitializer, UniversalRegistry } from '@hungpvq/map-core';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Map } from './Map';

beforeEach(() => {
  vi.spyOn(MapInitializer, 'validateWebglSupport').mockImplementation(
    () => undefined,
  );
  vi.spyOn(MapInitializer, 'isWebglSupported').mockReturnValue(true);
  vi.spyOn(MapInitializer, 'setupMapEvents').mockImplementation((map, cb) => {
    queueMicrotask(() => cb.onLoad?.(map));
    return () => undefined;
  });
});

const MAP_ID = 'ui-react-map-core';

afterEach(() => {
  UniversalRegistry.clearMap(MAP_ID);
  vi.restoreAllMocks();
  cleanup();
  document.body.innerHTML = '';
});

describe('Map UI smoke', () => {
  it('loads map shell and renders children after drag init', async () => {
    const onLoaded = vi.fn();
    render(
      <Map mapId={MAP_ID} onMapLoaded={onLoaded}>
        <div data-testid="map-child">child</div>
      </Map>,
    );

    await waitFor(() => expect(onLoaded).toHaveBeenCalled());
    expect(document.getElementById(`top-left-${MAP_ID}`)).toBeTruthy();
    expect(document.getElementById(`map-draggable-${MAP_ID}`)).toBeTruthy();
    await waitFor(() =>
      expect(document.querySelector('[data-testid="map-child"]')).toBeTruthy(),
    );
  });
});
