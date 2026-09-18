import { describe, expect, it } from 'vitest';
import {
  clampPanelPos,
  fitMovedPanelPos,
  reanchorPanelPos,
  syncDevtoolsShellPos,
  type DevtoolsShellLayout,
} from './panel-drag';

function mockEl(width: number, height: number, parent = 400) {
  return {
    offsetWidth: width,
    offsetHeight: height,
    offsetParent: {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: parent,
        height: parent,
        right: parent,
        bottom: parent,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    },
  } as unknown as HTMLElement;
}

describe('panel-drag', () => {
  it('clampPanelPos keeps within parent size', () => {
    const el = mockEl(100, 80, 400);
    expect(clampPanelPos(-10, -20, el)).toEqual({ left: 0, top: 0 });
    expect(clampPanelPos(500, 400, el)).toEqual({ left: 300, top: 320 });
  });

  it('reanchorPanelPos keeps bottom-right when growing', () => {
    const el = mockEl(200, 160, 400);
    expect(reanchorPanelPos({ left: 300, top: 220 }, 48, 48, el)).toEqual({
      left: 148,
      top: 108,
    });
  });

  it('fitMovedPanelPos reclamps when size unchanged', () => {
    const el = mockEl(100, 80, 400);
    expect(
      fitMovedPanelPos({ left: 500, top: 400 }, el, {
        width: 100,
        height: 80,
      }),
    ).toEqual({ left: 300, top: 320 });
  });

  it('syncDevtoolsShellPos restores toggle pos on close', () => {
    const toggle = mockEl(48, 48, 800);
    const panel = mockEl(600, 400, 800);
    let layout: DevtoolsShellLayout = {
      lastSize: { width: 48, height: 48 },
      savedTogglePos: null,
      wasOpen: false,
      draggedWhileOpen: false,
    };

    const opened = syncDevtoolsShellPos({
      pos: { left: 700, top: 700 },
      el: panel,
      isOpen: true,
      layout,
    });
    expect(opened.layout.savedTogglePos).toEqual({ left: 700, top: 700 });
    // Expand from BR then clamp (148,348) fits in 800×800.
    expect(opened.pos).toEqual({ left: 148, top: 348 });

    layout = opened.layout;
    const closed = syncDevtoolsShellPos({
      pos: opened.pos,
      el: toggle,
      isOpen: false,
      layout,
    });
    expect(closed.pos).toEqual({ left: 700, top: 700 });
  });
});
