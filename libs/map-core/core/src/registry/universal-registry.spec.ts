import { describe, expect, it, vi } from 'vitest';
import type { MapControlHandle } from './control';
import { runMapControlAction } from './control-action';
import { UniversalRegistry } from './universal-registry';

function fakeControl(
  id: string,
  run: (type?: string, event?: unknown) => void = () => undefined,
  overrides: Partial<MapControlHandle> = {},
): MapControlHandle {
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
    runAction: run,
    ...overrides,
  };
}

describe('UniversalRegistry', () => {
  it('resolves methods map-first then global', () => {
    const mapId = 'spec-method-map';
    UniversalRegistry.registerMethod('spec-export', () => 'global');
    UniversalRegistry.registerMethodForMap(mapId, 'spec-export', () => 'map');

    expect(UniversalRegistry.getMethod('spec-export')?.()).toBe('global');
    expect(UniversalRegistry.getMethod('spec-export', mapId)?.()).toBe('map');
    expect(UniversalRegistry.getMethod('spec-export', 'other')?.()).toBe(
      'global',
    );
    UniversalRegistry.clearMap(mapId);
  });

  it('resolves menu handlers on one path (map then global)', () => {
    const mapId = 'spec-menu-map';
    UniversalRegistry.registerMenuHandler('spec-toggle', () => 'global');
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      'spec-toggle',
      () => 'map',
    );

    expect(UniversalRegistry.getMenuHandler('spec-toggle', mapId)?.()).toBe(
      'map',
    );
    expect(UniversalRegistry.hasMenuHandler('spec-toggle', mapId)).toBe(true);
    expect(UniversalRegistry.hasMenuHandler('missing', mapId)).toBe(false);
    expect(UniversalRegistry.getKeysForMap(mapId, 'menu-handler')).toEqual([
      'spec-toggle',
    ]);
    UniversalRegistry.clearMap(mapId);
  });

  it('stores control handles per map and runs actions', () => {
    const mapId = 'spec-control-map';
    const calls: unknown[] = [];
    UniversalRegistry.registerControl(
      mapId,
      'mapHomeControl',
      fakeControl('mapHomeControl', (type, event) => {
        calls.push([type, event]);
      }),
    );

    expect(UniversalRegistry.listControls(mapId).map((c) => c.id)).toEqual([
      'mapHomeControl',
    ]);
    UniversalRegistry.runControlAction(mapId, 'mapHomeControl', 'click', {
      x: 1,
    });
    expect(calls).toEqual([['click', { x: 1 }]]);
    expect(
      UniversalRegistry.getControl('mapHomeControl', 'other'),
    ).toBeUndefined();
    UniversalRegistry.clearMap(mapId);
  });

  it('clearMap drops per-map methods, handlers, and controls only', () => {
    const mapId = 'spec-clear-map';
    UniversalRegistry.registerMethod('spec-keep', () => 'global');
    UniversalRegistry.registerMethodForMap(mapId, 'spec-keep', () => 'map');
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      'spec-fit',
      () => undefined,
    );
    UniversalRegistry.registerControl(
      mapId,
      'mapHomeControl',
      fakeControl('mapHomeControl'),
    );

    UniversalRegistry.clearMap(mapId);

    expect(UniversalRegistry.getMethod('spec-keep', mapId)?.()).toBe('global');
    expect(UniversalRegistry.hasMenuHandler('spec-fit', mapId)).toBe(false);
    expect(UniversalRegistry.listControls(mapId)).toEqual([]);
  });

  it('open/close/unregister and getKeysForMap for controls/methods', () => {
    const mapId = 'spec-panel-map';
    const open = vi.fn();
    const close = vi.fn();
    UniversalRegistry.registerControl(
      mapId,
      'mapGotoControl',
      fakeControl('mapGotoControl', undefined, { open, close }),
    );
    UniversalRegistry.registerMethodForMap(mapId, 'spec-tool', () => 1);

    expect(UniversalRegistry.getKeysForMap(mapId, 'control')).toEqual([
      'mapGotoControl',
    ]);
    expect(UniversalRegistry.getKeysForMap(mapId, 'method')).toEqual([
      'spec-tool',
    ]);
    expect(UniversalRegistry.getKeysForMap(mapId, 'component')).toEqual([]);

    UniversalRegistry.openControl(mapId, 'mapGotoControl');
    UniversalRegistry.closeControl(mapId, 'mapGotoControl');
    expect(open).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();

    UniversalRegistry.unregisterControl(mapId, 'mapGotoControl');
    expect(
      UniversalRegistry.getControl('mapGotoControl', mapId),
    ).toBeUndefined();
    UniversalRegistry.clearMap(mapId);
  });

  it('setControlPosition forwards to the handle', () => {
    const mapId = 'spec-pos-map';
    const setPanelPosition = vi.fn();
    UniversalRegistry.registerControl(
      mapId,
      'mapGotoControl',
      fakeControl('mapGotoControl', undefined, { setPanelPosition }),
    );

    UniversalRegistry.setControlPosition(mapId, 'mapGotoControl', {
      top: 10,
      right: 20,
    });
    expect(setPanelPosition).toHaveBeenCalledWith({ top: 10, right: 20 });
    UniversalRegistry.clearMap(mapId);
  });
});

describe('runMapControlAction', () => {
  it('uses UniversalRegistry when no custom runner is registered', () => {
    const mapId = 'spec-run-action-map';
    const calls: unknown[] = [];
    UniversalRegistry.registerControl(
      mapId,
      'mapHomeControl',
      fakeControl('mapHomeControl', (type, event) => {
        calls.push([type, event]);
      }),
    );

    runMapControlAction(mapId, 'mapHomeControl', undefined, 'evt');
    expect(calls).toEqual([[undefined, 'evt']]);

    UniversalRegistry.clearMap(mapId);
  });

  it('no-ops when the control is missing', () => {
    expect(() =>
      runMapControlAction('missing-map', 'mapHomeControl'),
    ).not.toThrow();
  });
});
