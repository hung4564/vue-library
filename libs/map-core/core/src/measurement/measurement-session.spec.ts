import { describe, expect, it, vi } from 'vitest';

import type { MapSimple } from '../types';
import { createMeasurementSession } from './measurement-session';

function fakeMap(id = 'm1'): MapSimple {
  return {
    id,
    getSource: () => undefined,
    addSource: () => undefined,
    addLayer: () => undefined,
    removeLayer: () => undefined,
    removeSource: () => undefined,
    getLayer: () => undefined,
    on: () => undefined,
    off: () => undefined,
    fitBounds: () => undefined,
  } as unknown as MapSimple;
}

describe('createMeasurementSession', () => {
  it('toggles the same mode off', () => {
    const onStateChange = vi.fn();
    const session = createMeasurementSession({
      callMap: (fn) => fn(fakeMap()),
      onStateChange,
    });

    expect(session.startMode('distance')).toBe(true);
    expect(session.getState().measurementType).toBe('distance');

    expect(session.startMode('distance')).toBe(false);
    expect(session.getState().measurementType).toBeUndefined();
    session.destroy();
  });

  it('switches between modes', () => {
    const session = createMeasurementSession({
      callMap: (fn) => fn(fakeMap()),
    });

    session.startMode('distance');
    session.startMode('area');
    expect(session.getState().measurementType).toBe('area');
    expect(session.getHandler().action?.type).toBe('area');
    session.destroy();
  });

  it('clear and destroy drop the active mode', () => {
    const onEventClickActive = vi.fn();
    const session = createMeasurementSession({
      callMap: (fn) => fn(fakeMap()),
      onEventClickActive,
    });

    session.startMode('radius');
    session.clear();
    expect(session.getState().measurementType).toBeUndefined();
    expect(session.getHandler().action).toBeNull();

    session.startMode('angle');
    session.destroy();
    expect(session.getState().measurementType).toBeUndefined();
    expect(onEventClickActive).toHaveBeenCalledWith(false);
  });

  it('addMapClick is a no-op without an active action', () => {
    const session = createMeasurementSession({
      callMap: (fn) => fn(fakeMap()),
    });
    session.addMapClick(1, 2);
    expect(session.getState().coordinates).toEqual([]);
    session.destroy();
  });

  it('toggleSetting flips setting.show', () => {
    const session = createMeasurementSession({
      callMap: (fn) => fn(fakeMap()),
    });
    expect(session.getState().setting.show).toBe(true);
    session.toggleSetting();
    expect(session.getState().setting.show).toBe(false);
    session.destroy();
  });
});
