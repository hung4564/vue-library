import { describe, expect, it } from 'vitest';
import { clampPanelPos, panelPosStyle } from './panel-drag';

describe('panel-drag', () => {
  it('clampPanelPos keeps within parent size', () => {
    const el = {
      offsetWidth: 100,
      offsetHeight: 80,
      offsetParent: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 400,
          height: 300,
          right: 400,
          bottom: 300,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }),
      },
    } as unknown as HTMLElement;

    expect(clampPanelPos(-10, -20, el)).toEqual({ left: 0, top: 0 });
    expect(clampPanelPos(500, 400, el)).toEqual({ left: 300, top: 220 });
  });

  it('panelPosStyle clears right/bottom anchors', () => {
    expect(panelPosStyle(null)).toBeUndefined();
    expect(panelPosStyle({ left: 12, top: 34 })).toEqual({
      left: '12px',
      top: '34px',
      right: 'auto',
      bottom: 'auto',
    });
  });
});
