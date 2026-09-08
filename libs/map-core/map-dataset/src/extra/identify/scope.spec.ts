import {
  UniversalRegistry,
  type MapControlHandle,
} from '@hungpvq/map-core';
import type { FeatureCollection } from 'geojson';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createGeoJsonDataset,
  findAllComponentsByType,
  IDENTIFY_CONTROL,
  isIdentifyForListMenuHidden,
} from '../../index';

const pointCollection: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'A' },
      geometry: { type: 'Point', coordinates: [106.7, 10.8] },
    },
  ],
};

function fakeIdentifyControl(id = IDENTIFY_CONTROL.id): MapControlHandle {
  return {
    id,
    panelKind: 'button',
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
  };
}

describe('isIdentifyForListMenuHidden', () => {
  const mapId = 'spec-identify-list-menu';

  afterEach(() => {
    UniversalRegistry.clearMap(mapId);
  });

  it('hides without layer', () => {
    expect(isIdentifyForListMenuHidden({ layer: undefined as never })).toBe(
      true,
    );
  });

  it('hides when IdentifyControl is not mounted', () => {
    const dataset = createGeoJsonDataset({
      name: 'Cities',
      geojson: pointCollection,
      type: 'point',
    });
    const list = findAllComponentsByType(dataset, 'list')[0];

    expect(isIdentifyForListMenuHidden({ layer: list, mapId })).toBe(true);
  });

  it('shows when identify sibling exists and IdentifyControl is mounted', () => {
    const dataset = createGeoJsonDataset({
      name: 'Cities',
      geojson: pointCollection,
      type: 'point',
    });
    const list = findAllComponentsByType(dataset, 'list')[0];
    UniversalRegistry.registerControl(
      mapId,
      IDENTIFY_CONTROL.id,
      fakeIdentifyControl(),
    );

    expect(isIdentifyForListMenuHidden({ layer: list, mapId })).toBe(false);
  });

  it('hides when mapId is missing even if control exists elsewhere', () => {
    const dataset = createGeoJsonDataset({
      name: 'Cities',
      geojson: pointCollection,
      type: 'point',
    });
    const list = findAllComponentsByType(dataset, 'list')[0];
    UniversalRegistry.registerControl(
      mapId,
      IDENTIFY_CONTROL.id,
      fakeIdentifyControl(),
    );

    expect(isIdentifyForListMenuHidden({ layer: list })).toBe(true);
  });
});
