import { ensureMapMitt } from '@hungpvq/map-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bindHighlightMittBridge,
  cleanHighlightMittBridge,
  destroyHighlightMittBridge,
  ensureHighlightMittBridge,
  MAP_DATASET_EVENT,
  releaseHighlightMittBridge,
  type MapDatasetEvent,
} from './mitt';

const hideIfSource = vi.fn();
const hideEntry = vi.fn();
const closeIdentifyExclusiveUi = vi.fn();

vi.mock('./controller', () => ({
  getHighlightController: () => ({
    hideIfSource,
    hideEntry,
    show: vi.fn(),
    setPointerClickEnabled: vi.fn(),
  }),
}));

vi.mock('../identify/close-exclusive-ui', () => ({
  closeIdentifyExclusiveUi: (...args: unknown[]) =>
    closeIdentifyExclusiveUi(...args),
}));

describe('highlight mitt bridge', () => {
  beforeEach(() => {
    hideIfSource.mockReset();
    hideEntry.mockReset();
    closeIdentifyExclusiveUi.mockReset();
    destroyHighlightMittBridge('m1');
  });

  it('ATTRIBUTE_TABLE_CLOSE clears attribute-table source', () => {
    ensureHighlightMittBridge('m1');
    ensureMapMitt<MapDatasetEvent>('m1').emit(
      MAP_DATASET_EVENT.ATTRIBUTE_TABLE_CLOSE,
      { mapId: 'm1', dataset: { id: 'layer-1' } as never },
    );
    expect(hideIfSource).toHaveBeenCalledWith('attribute-table');
  });

  it('bindHighlightMittBridge returns a clean disposer', () => {
    const unbind = bindHighlightMittBridge('m1');
    ensureMapMitt<MapDatasetEvent>('m1').emit(
      MAP_DATASET_EVENT.ATTRIBUTE_TABLE_CLOSE,
      { mapId: 'm1' },
    );
    expect(hideIfSource).toHaveBeenCalledTimes(1);

    unbind();
    hideIfSource.mockReset();
    ensureMapMitt<MapDatasetEvent>('m1').emit(
      MAP_DATASET_EVENT.ATTRIBUTE_TABLE_CLOSE,
      { mapId: 'm1' },
    );
    expect(hideIfSource).not.toHaveBeenCalled();
  });

  it('release is ref-counted across consumers', () => {
    ensureHighlightMittBridge('m1');
    ensureHighlightMittBridge('m1');
    releaseHighlightMittBridge('m1');
    ensureMapMitt<MapDatasetEvent>('m1').emit(
      MAP_DATASET_EVENT.ATTRIBUTE_TABLE_CLOSE,
      { mapId: 'm1' },
    );
    expect(hideIfSource).toHaveBeenCalledTimes(1);

    releaseHighlightMittBridge('m1');
    hideIfSource.mockReset();
    ensureMapMitt<MapDatasetEvent>('m1').emit(
      MAP_DATASET_EVENT.ATTRIBUTE_TABLE_CLOSE,
      { mapId: 'm1' },
    );
    expect(hideIfSource).not.toHaveBeenCalled();
  });

  it('cleanHighlightMittBridge force-unbinds (alias destroy)', () => {
    ensureHighlightMittBridge('m1');
    ensureHighlightMittBridge('m1');
    cleanHighlightMittBridge('m1');
    ensureMapMitt<MapDatasetEvent>('m1').emit(
      MAP_DATASET_EVENT.ATTRIBUTE_TABLE_CLOSE,
      { mapId: 'm1' },
    );
    expect(hideIfSource).not.toHaveBeenCalled();
  });

  it('DETAIL_CLOSE clears detail + feature entry', () => {
    ensureHighlightMittBridge('m1');
    ensureMapMitt<MapDatasetEvent>('m1').emit(
      MAP_DATASET_EVENT.DETAIL_CLOSE,
      {
        mapId: 'm1',
        item: { id: 'f1' },
        dataset: { id: 'layer-1' } as never,
      },
    );
    expect(hideIfSource).toHaveBeenCalledWith('detail');
    expect(hideEntry).toHaveBeenCalledWith('f1');
  });

  it('IDENTIFY_CLOSE dismisses exclusive UI + identify', () => {
    ensureHighlightMittBridge('m1');
    ensureMapMitt<MapDatasetEvent>('m1').emit(
      MAP_DATASET_EVENT.IDENTIFY_CLOSE,
      { mapId: 'm1', dataset: { id: 'id-1' } as never },
    );
    expect(closeIdentifyExclusiveUi).toHaveBeenCalledWith('m1');
    expect(hideIfSource).toHaveBeenCalledWith('identify');
  });
});
