import { describe, expect, it, vi } from 'vitest';
import type { MapSimple } from '../types';
import {
  createPrintAdvancedSession,
  DEFAULT_PRINT_ADVANCED_SETTING,
} from './print-advanced-session';

vi.mock('./utils', () => ({
  exportMapbox: vi.fn(async () => 'data:full'),
  exportMapboxWithOptions: vi.fn(async () => 'data:cut'),
}));

vi.mock('./CrosshairManager', () => ({
  CrosshairManager: class {
    create = vi.fn();
    destroy = vi.fn();
    mapResize = vi.fn();
  },
}));

vi.mock('./PrintableAreaManager', () => ({
  PrintableAreaManager: class {
    create = vi.fn();
    destroy = vi.fn();
    mapResize = vi.fn();
    setOption = vi.fn();
    getCutSize = vi.fn(() => ({
      width: 100,
      height: 80,
      startX: 10,
      startY: 20,
    }));
  },
}));

function fakeMap(): MapSimple {
  return {
    getCanvas: () =>
      ({
        clientWidth: 800,
        clientHeight: 600,
        parentElement: { appendChild: vi.fn() },
      }) as unknown as HTMLCanvasElement,
    on: vi.fn(),
    off: vi.fn(),
  } as unknown as MapSimple;
}

describe('createPrintAdvancedSession', () => {
  it('starts with default setting and toggles show/close overlays', () => {
    const callMap = vi.fn((fn: (map: MapSimple) => void) => fn(fakeMap()));
    const onStateChange = vi.fn();
    const session = createPrintAdvancedSession({ callMap, onStateChange });

    expect(session.getState().setting).toEqual(DEFAULT_PRINT_ADVANCED_SETTING);
    expect(session.getState().show).toBe(false);

    session.show();
    expect(session.getState().show).toBe(true);
    expect(callMap).toHaveBeenCalled();
    expect(onStateChange).toHaveBeenCalled();

    session.close();
    expect(session.getState().show).toBe(false);
    expect(session.getState().loading).toBe(false);
  });

  it('applyPaper sets a4 ratio preset', () => {
    const session = createPrintAdvancedSession({
      callMap: (fn) => fn(fakeMap()),
    });
    session.applyPaper('a4');
    expect(session.getState().setting.paper).toBe('a4');
    expect(session.getState().setting.ratio).toBe(1.414);
  });

  it('save exports cut region then saveFile', async () => {
    const { exportMapboxWithOptions } = await import('./utils');
    const saveFile = vi.fn();
    const session = createPrintAdvancedSession({
      callMap: (fn) => {
        void fn(fakeMap());
      },
      saveFile,
      getFileName: () => 'snapshot',
    });
    session.show();
    session.save();
    await vi.waitFor(() => {
      expect(exportMapboxWithOptions).toHaveBeenCalled();
      expect(saveFile).toHaveBeenCalledWith('data:cut', 'snapshot.png');
    });
    expect(session.getState().loading).toBe(false);
  });

  it('saveAll exports full map', async () => {
    const { exportMapbox } = await import('./utils');
    const saveFile = vi.fn();
    const session = createPrintAdvancedSession({
      callMap: (fn) => {
        void fn(fakeMap());
      },
      saveFile,
    });
    session.saveAll();
    await vi.waitFor(() => {
      expect(exportMapbox).toHaveBeenCalled();
      expect(saveFile).toHaveBeenCalledWith('data:full', 'map.png');
    });
  });

  it('getStoreHandlers wires show/close/save/saveAll', () => {
    const session = createPrintAdvancedSession({
      callMap: (fn) => fn(fakeMap()),
    });
    const handlers = session.getStoreHandlers();
    handlers.show?.(DEFAULT_PRINT_ADVANCED_SETTING);
    expect(session.getState().show).toBe(true);
    handlers.close?.();
    expect(session.getState().show).toBe(false);
  });

  it('skips overlays when disabled', () => {
    const callMap = vi.fn((fn: (map: MapSimple) => void) => fn(fakeMap()));
    const session = createPrintAdvancedSession({
      callMap,
      getDisabledCrosshair: () => true,
      getDisabledPrintableArea: () => true,
    });
    session.show();
    // callMap only used for toggle* when not disabled — both skip, so none
    expect(callMap).not.toHaveBeenCalled();
    expect(session.getState().show).toBe(true);
  });
});
