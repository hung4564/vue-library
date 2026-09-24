import { describe, expect, it } from 'vitest';

import {
  buildIdentifyClosePanelPayload,
  createIdentifyControlModel,
  resolveIdentifyScopedSession,
  resolveIdentifySessionToggle,
  shouldBindIdentifyLongPress,
} from './control-model';
import { IDENTIFY_ALL_LAYERS_VALUE } from './result';

describe('identify control-model', () => {
  it('buildIdentifyClosePanelPayload clears panel', () => {
    expect(buildIdentifyClosePanelPayload()).toEqual({
      show: false,
      loading: false,
      origin: { latitude: 0, longitude: 0 },
      selectedLayerId: IDENTIFY_ALL_LAYERS_VALUE,
      items: [],
    });
  });

  it('shouldBindIdentifyLongPress follows coarse profile', () => {
    expect(shouldBindIdentifyLongPress({ coarse: true })).toBe(true);
    expect(shouldBindIdentifyLongPress({ coarse: false })).toBe(false);
  });

  it('resolveIdentifyScopedSession activates / clears / noop', () => {
    expect(
      resolveIdentifyScopedSession(
        { active: true, identifyId: 'id-1' },
        { filterIdentifyId: undefined, isUseClick: false },
      ).kind,
    ).toBe('activate');
    expect(
      resolveIdentifyScopedSession(
        { active: false, identifyId: 'id-1' },
        { filterIdentifyId: 'id-1', isUseClick: true },
      ).kind,
    ).toBe('clear-matching');
    expect(
      resolveIdentifyScopedSession(
        { active: false, identifyId: 'other' },
        { filterIdentifyId: 'id-1', isUseClick: true },
      ).kind,
    ).toBe('noop');
  });

  it('resolveIdentifySessionToggle starts click when opening', () => {
    expect(resolveIdentifySessionToggle(false, false)).toEqual({
      show: true,
      panel: { show: true },
      startMapClick: true,
      removeIdentify: false,
    });
    expect(resolveIdentifySessionToggle(true, true)).toEqual({
      show: false,
      panel: { show: false },
      startMapClick: false,
      removeIdentify: true,
    });
  });

  it('createIdentifyControlModel mutates session on scoped / toggle / close', () => {
    const model = createIdentifyControlModel();
    const activated = model.applyScopedSession({
      active: true,
      identifyId: 'x',
    });
    expect(activated.kind).toBe('activate');
    expect(model.getState().filterIdentifyId).toBe('x');
    expect(model.getState().show).toBe(false);

    model.setShow(true);
    const toggled = model.toggleShow();
    expect(toggled.show).toBe(false);
    expect(toggled.removeIdentify).toBe(true);

    model.setShow(true);
    model.setUseClick(true);
    const closed = model.close();
    expect(closed.clearScope).toBe(true);
    expect(model.getState().show).toBe(false);
    expect(model.getState().filterIdentifyId).toBeUndefined();
  });
});
