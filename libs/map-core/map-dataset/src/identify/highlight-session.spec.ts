import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearHighlight,
  onDetailClose,
  onIdentifyClose,
  paintHighlight,
  paintHighlights,
  paintIdentifyResultFocus,
  syncIdentifyPointerPick,
} from './highlight-session';

const show = vi.fn();
const showMany = vi.fn();
const hideIfSource = vi.fn();
const hideEntry = vi.fn();
const setPointerClickEnabled = vi.fn();
const closeIdentifyExclusiveUi = vi.fn();

vi.mock('../highlight/controller', () => ({
  getHighlightController: () => ({
    show,
    showMany,
    hideIfSource,
    hideEntry,
    setPointerClickEnabled,
  }),
}));

vi.mock('./close-exclusive-ui', () => ({
  closeIdentifyExclusiveUi: (...args: unknown[]) =>
    closeIdentifyExclusiveUi(...args),
}));

const point = {
  type: 'Feature' as const,
  id: 'f1',
  geometry: { type: 'Point' as const, coordinates: [0, 0] },
  properties: { id: 'f1' },
};

describe('highlight session API (UX A–F)', () => {
  beforeEach(() => {
    show.mockReset();
    showMany.mockReset();
    hideIfSource.mockReset();
    hideEntry.mockReset();
    setPointerClickEnabled.mockReset();
    closeIdentifyExclusiveUi.mockReset();
  });

  it('A: paintHighlight(detail) uses source detail (cascade duration)', async () => {
    await paintHighlight('m1', {
      intent: 'detail',
      feature: point,
    });
    expect(show).toHaveBeenCalledWith(point, {
      source: 'detail',
      dataset: undefined,
    });
  });

  it('A: onDetailClose clears detail + feature entry', () => {
    onDetailClose('m1', { id: 'f1' });
    expect(hideIfSource).toHaveBeenCalledWith('detail');
    expect(hideEntry).toHaveBeenCalledWith('f1');
  });

  it('B: paintIdentifyResultFocus paints identify; null clears session', async () => {
    await paintIdentifyResultFocus('m1', {
      id: 'f1',
      data: point,
      identify: { id: 'ds' } as never,
    });
    expect(show).toHaveBeenCalledWith(point, {
      source: 'identify',
      dataset: { id: 'ds' },
    });

    show.mockReset();
    hideIfSource.mockReset();
    await paintIdentifyResultFocus('m1', null);
    expect(hideIfSource).toHaveBeenCalledWith('identify');
    expect(show).not.toHaveBeenCalled();
  });

  it('C: clearHighlight({ featureId }) does not clear unrelated sources', () => {
    clearHighlight('m1', { featureId: 'f1' });
    expect(hideEntry).toHaveBeenCalledWith('f1');
    expect(hideIfSource).not.toHaveBeenCalled();
  });

  it('E: paintHighlight(attribute-table); clear intent', async () => {
    await paintHighlight('m1', {
      intent: 'attribute-table',
      feature: point,
    });
    expect(show).toHaveBeenCalledWith(point, {
      source: 'attribute-table',
      dataset: undefined,
    });
    clearHighlight('m1', 'attribute-table');
    expect(hideIfSource).toHaveBeenCalledWith('attribute-table');
  });

  it('E: paintHighlights multi clears then showMany', async () => {
    const a = { ...point, id: 'a', properties: { id: 'a' } };
    const b = {
      ...point,
      id: 'b',
      geometry: { type: 'Point' as const, coordinates: [1, 1] },
      properties: { id: 'b' },
    };
    await paintHighlights('m1', {
      intent: 'attribute-table',
      features: [a, b],
    });
    expect(hideIfSource).toHaveBeenCalledWith('attribute-table');
    expect(showMany).toHaveBeenCalled();
    expect(show).not.toHaveBeenCalled();
  });

  it('F: syncIdentifyPointerPick toggles pointerClickEnabled', () => {
    syncIdentifyPointerPick('m1', true);
    expect(setPointerClickEnabled).toHaveBeenCalledWith(false);
    syncIdentifyPointerPick('m1', false);
    expect(setPointerClickEnabled).toHaveBeenCalledWith(true);
  });

  it('onIdentifyClose dismisses exclusive UI + identify source', () => {
    onIdentifyClose('m1');
    expect(closeIdentifyExclusiveUi).toHaveBeenCalledWith('m1');
    expect(hideIfSource).toHaveBeenCalledWith('identify');
  });

  it('clearHighlight(identify-session) clears identify source', () => {
    clearHighlight('m1', 'identify-session');
    expect(hideIfSource).toHaveBeenCalledWith('identify');
  });
});
