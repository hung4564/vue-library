import { MapInitializer, UniversalRegistry } from '@hungpvq/map-core';
import { IDENTIFY_CONTROL } from '@hungpvq/map-dataset';
import { Map } from '@hungpvq/react-map-core';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDatasetRegistryPlugin } from '../plugin';
import { IdentifyControl } from './IdentifyControl/IdentifyControl';
import { LayerControl } from './LayerControl/LayerControl';

beforeAll(() => {
  createDatasetRegistryPlugin().install();
});

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

const MAP_ID = 'ui-react-map-dataset';

afterEach(() => {
  UniversalRegistry.clearMap(MAP_ID);
  vi.restoreAllMocks();
  cleanup();
  document.body.innerHTML = '';
});

describe('LayerControl + IdentifyControl UI smoke', () => {
  it('registers controls when mounted inside Map', async () => {
    render(
      <Map mapId={MAP_ID}>
        <LayerControl />
        <IdentifyControl />
      </Map>,
    );

    await waitFor(() =>
      expect(
        UniversalRegistry.getControl('mapLayerControl', MAP_ID),
      ).toBeTruthy(),
    );
    await waitFor(() =>
      expect(
        UniversalRegistry.getControl(IDENTIFY_CONTROL.id, MAP_ID),
      ).toBeTruthy(),
    );
    expect(document.getElementById(`top-left-${MAP_ID}`)).toBeTruthy();
  });
});
