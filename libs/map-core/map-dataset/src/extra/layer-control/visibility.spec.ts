import type { MapSimple } from '@hungpvq/map-core';
import { describe, expect, it, vi } from 'vitest';

import type { IListViewUI } from '../../model/list/types';
import {
  applyAllLayerVisibility,
  applyGlobalLayerVisibility,
  syncAllLayerIntendedShow,
} from './visibility';

const map = { id: 'map-1' } as MapSimple;

/** List row + mapbox child so override toggles map without changing list `show`. */
function makeListWithMapbox(show: boolean, id = 'layer') {
  const mapToggle = vi.fn();
  const mapbox = {
    id: `${id}-mapbox`,
    type: 'mapbox-layer',
    getName: () => `${id}-mapbox`,
    getParent: () => list,
    toggleShow: mapToggle,
    setOpacity: vi.fn(),
    moveLayer: vi.fn(),
    getBeforeId: vi.fn(),
  };

  const listToggle = vi.fn(function (
    this: { show: boolean },
    _m: MapSimple,
    next: boolean,
  ) {
    this.show = !!next;
  });

  const list = {
    id,
    type: 'list',
    show,
    getName: () => id,
    getParent: () => list,
    getChildren: () => [mapbox],
    toggleShow: listToggle,
  } as unknown as IListViewUI & { show: boolean };

  mapbox.getParent = () => list;

  return { list, mapbox, mapToggle, listToggle };
}

describe('layer visibility helpers', () => {
  it('applyGlobalLayerVisibility override leaves list show unchanged when hiding', () => {
    const { list, mapToggle } = makeListWithMapbox(true);
    applyGlobalLayerVisibility([list], map, false);
    expect(list.show).toBe(true);
    expect(mapToggle).toHaveBeenCalledWith(map, false);
  });

  it('applyGlobalLayerVisibility restores map from list show when showing', () => {
    const on = makeListWithMapbox(true, 'on');
    const off = makeListWithMapbox(false, 'off');
    applyGlobalLayerVisibility([on.list, off.list], map, true);
    expect(on.mapToggle).toHaveBeenCalledWith(map, true);
    expect(off.mapToggle).toHaveBeenCalledWith(map, false);
    expect(on.list.show).toBe(true);
    expect(off.list.show).toBe(false);
  });

  it('syncAllLayerIntendedShow updates list show via list.toggleShow and map', () => {
    const a = makeListWithMapbox(true, 'a');
    const b = makeListWithMapbox(false, 'b');
    syncAllLayerIntendedShow([a.list, b.list], map, false);
    expect(a.list.show).toBe(false);
    expect(b.list.show).toBe(false);
    expect(a.listToggle).toHaveBeenCalledWith(map, false);
    expect(b.listToggle).toHaveBeenCalledWith(map, false);
    expect(a.mapToggle).toHaveBeenCalledWith(map, false);
    expect(b.mapToggle).toHaveBeenCalledWith(map, false);
  });

  it('applyAllLayerVisibility dispatches override vs sync', () => {
    const overrideCase = makeListWithMapbox(true, 'ov');
    applyAllLayerVisibility([overrideCase.list], map, false, 'override');
    expect(overrideCase.list.show).toBe(true);

    const syncCase = makeListWithMapbox(true, 'sy');
    applyAllLayerVisibility([syncCase.list], map, false, 'sync');
    expect(syncCase.list.show).toBe(false);
  });
});
