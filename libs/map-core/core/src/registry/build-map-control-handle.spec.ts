import { describe, expect, it, vi } from 'vitest';

import { buildMapControlHandle } from './build-map-control-handle';

describe('buildMapControlHandle', () => {
  it('runs single action when type omitted', () => {
    const run = vi.fn();
    const handle = buildMapControlHandle({
      id: 'mapTest',
      panelKind: 'popup',
      actions: [{ type: 'mapTest', run }],
      isOpen: () => false,
      setShow: vi.fn(),
      getPanelPosition: () => ({}),
      setPanelPosition: vi.fn(),
    });
    handle.runAction(undefined, 'evt');
    expect(run).toHaveBeenCalledWith('evt');
  });

  it('toggles show when no actions and type omitted', () => {
    const setShow = vi.fn();
    const handle = buildMapControlHandle({
      id: 'mapTest',
      panelKind: 'button',
      isOpen: () => false,
      setShow,
      getPanelPosition: () => ({}),
      setPanelPosition: vi.fn(),
    });
    handle.runAction();
    expect(setShow).toHaveBeenCalledWith(true);
  });

  it('uses defaultActionType for multi-action controls', () => {
    const primary = vi.fn();
    const secondary = vi.fn();
    const handle = buildMapControlHandle({
      id: 'mapTest',
      panelKind: 'popup',
      defaultActionType: 'primary',
      actions: [
        { type: 'primary', run: primary },
        { type: 'secondary', run: secondary },
      ],
      isOpen: () => true,
      setShow: vi.fn(),
      getPanelPosition: () => ({ top: 1 }),
      setPanelPosition: vi.fn(),
    });
    handle.runAction();
    expect(primary).toHaveBeenCalled();
    expect(secondary).not.toHaveBeenCalled();
    expect(handle.getPanelPosition()).toEqual({ top: 1 });
  });
});
