import { describe, expect, it, vi } from 'vitest';
import type { FeatureCollection } from 'geojson';
import type { IDataset } from '../interfaces/dataset.base';
import { setGeoExportActiveSource, clearGeoExportActiveSource } from './active-source';
import { createGeoExportController } from './controller';

const fc: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: '1',
      properties: { name: 'A' },
      geometry: { type: 'Point', coordinates: [0, 0] },
    },
  ],
};

const fakeLayer = {
  id: 'layer-1',
  getName: () => 'Cities',
  getParent: () => undefined,
} as unknown as IDataset;

describe('createGeoExportController', () => {
  it('defaults to modal uiMode and all formats', () => {
    const ctrl = createGeoExportController(fakeLayer);
    expect(ctrl.getUiMode()).toBe('modal');
    expect(ctrl.getFormats().length).toBeGreaterThan(0);
    expect(ctrl.getScopes()).toEqual(['all']);
    ctrl.dispose();
  });

  it('preserves uiMode click', () => {
    const ctrl = createGeoExportController(fakeLayer, { uiMode: 'click' });
    expect(ctrl.getUiMode()).toBe('click');
    ctrl.dispose();
  });

  it('runs custom onExport and sets busy', async () => {
    let resolveExport: (() => void) | undefined;
    const onExport = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveExport = resolve;
        }),
    );
    const ctrl = createGeoExportController(fakeLayer, {
      onExport,
      getCollection: async () => fc,
    });

    const pending = ctrl.run({ format: 'geojson' });
    // Allow onExport to start and assign resolveExport
    await Promise.resolve();
    expect(ctrl.getState().busy).toBe(true);
    expect(ctrl.canExport()).toBe(false);
    expect(resolveExport).toBeTypeOf('function');
    resolveExport!();
    await expect(pending).resolves.toBe(true);
    expect(onExport).toHaveBeenCalled();
    expect(ctrl.getState().busy).toBe(false);
    ctrl.dispose();
  });

  it('run returns false after dispose without calling onExport', async () => {
    const onExport = vi.fn(async () => undefined);
    const ctrl = createGeoExportController(fakeLayer, {
      onExport,
      getCollection: async () => fc,
    });
    ctrl.dispose();
    await expect(ctrl.run({ format: 'geojson' })).resolves.toBe(false);
    expect(onExport).not.toHaveBeenCalled();
  });

  it('rejects with No features to export when collection is empty', async () => {
    const ctrl = createGeoExportController(fakeLayer, {
      getCollection: async () => ({ type: 'FeatureCollection', features: [] }),
    });
    await expect(ctrl.run({ format: 'geojson' })).rejects.toThrow(
      'No features to export',
    );
    expect(ctrl.getState().error).toBe('No features to export');
    expect(ctrl.getState().busy).toBe(false);
    expect(ctrl.canExport()).toBe(true);
    ctrl.dispose();
  });

  it('suggests selected scope when AT bridge has selection', () => {
    setGeoExportActiveSource('map-1', {
      layerId: 'layer-1',
      getSearch: () => '',
      getSort: () => [],
      getSelectedIds: () => ['1'],
      resolveSelectedCollection: async () => fc,
      resolveFilteredCollection: async () => fc,
    });
    const ctrl = createGeoExportController(fakeLayer, {
      mapId: 'map-1',
      scopes: ['all', 'filtered', 'selected'],
    });
    expect(ctrl.suggestDefaultScope('map-1')).toBe('selected');
    clearGeoExportActiveSource('map-1');
    ctrl.dispose();
  });

  it('createExportGeoAddComponent uses GEO_EXPORT_COMPONENT_KEY.root', () => {
    const loading = { name: 'Loading' };
    const ctrl = createGeoExportController(fakeLayer, {
      mapId: 'm',
      formComponent: 'local-form',
      loadingComponent: loading,
    });
    const add = ctrl.createExportGeoAddComponent('m');
    expect(add.componentKey).toBe('layer-action-export-geo');
    expect(add.attr?.mapId).toBe('m');
    expect(add.attr).toHaveProperty('exportHandler');
    expect(add.attr).toMatchObject({
      formComponent: 'local-form',
      loadingComponent: loading,
    });
    ctrl.dispose();
  });

  it('aborts when signal is already aborted', async () => {
    const ctrl = createGeoExportController(fakeLayer, {
      getCollection: async () => fc,
    });
    const signal = AbortSignal.abort();
    await expect(ctrl.run({ format: 'geojson', signal })).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(ctrl.getState().busy).toBe(false);
    ctrl.dispose();
  });

  it('aborts after handler when signal aborts during onExport', async () => {
    const ac = new AbortController();
    const onExport = vi.fn(async () => {
      ac.abort();
      return new Blob(['x'], { type: 'text/plain' });
    });
    const ctrl = createGeoExportController(fakeLayer, {
      onExport,
      getCollection: async () => fc,
    });
    await expect(
      ctrl.run({ format: 'geojson', signal: ac.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(onExport).toHaveBeenCalled();
    ctrl.dispose();
  });
});
