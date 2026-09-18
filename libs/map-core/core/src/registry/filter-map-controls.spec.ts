import { describe, expect, it } from 'vitest';
import { filterMapControls, type MapControlHandle } from './control';

function ctrl(
  partial: Partial<MapControlHandle> & Pick<MapControlHandle, 'id'>,
): MapControlHandle {
  return {
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
    ...partial,
  };
}

describe('filterMapControls', () => {
  const list = [
    ctrl({
      id: 'mapLayerControl',
      panelKind: 'sidebar',
      title: 'Layers',
    }),
    ctrl({
      id: 'mapHomeControl',
      panelKind: 'button',
      actions: [{ type: 'mapHomeControl', title: 'Go home' }],
    }),
    ctrl({
      id: 'mapMeasurementControl',
      panelKind: 'button',
      defaultActionType: 'distance',
      actions: [{ type: 'distance', title: 'Distance' }],
    }),
  ];

  it('returns a copy when query is empty', () => {
    const next = filterMapControls(list, '  ');
    expect(next).toEqual(list);
    expect(next).not.toBe(list);
  });

  it('matches id, panelKind, title, defaultActionType, and action meta', () => {
    expect(filterMapControls(list, 'layer').map((c) => c.id)).toEqual([
      'mapLayerControl',
    ]);
    expect(filterMapControls(list, 'SIDEBAR').map((c) => c.id)).toEqual([
      'mapLayerControl',
    ]);
    expect(filterMapControls(list, 'go home').map((c) => c.id)).toEqual([
      'mapHomeControl',
    ]);
    expect(filterMapControls(list, 'distance').map((c) => c.id)).toEqual([
      'mapMeasurementControl',
    ]);
  });

  it('returns empty when nothing matches', () => {
    expect(filterMapControls(list, 'zzz')).toEqual([]);
  });
});
