import { describe, expect, it } from 'vitest';

import { planToolbarLayout } from './plan';
import type { MapControlButtonState } from './types';

function btn(
  id: string,
  extra: Partial<MapControlButtonState> = {},
): MapControlButtonState {
  return { id, action: () => undefined, ...extra };
}

describe('planToolbarLayout', () => {
  it('plans row overflow for desktop toolbar mode', () => {
    const buttons = [btn('a'), btn('b'), btn('c'), btn('d'), btn('e')];
    const plan = planToolbarLayout({
      buttons,
      menuMode: false,
      hostHeight: 400,
      availableWidth: 120,
      maxVisible: 3,
    });

    expect(plan.groups).toHaveLength(5);
    expect(plan.toolbarSplit.visible.length).toBeGreaterThan(0);
    expect(plan.toolbarSplit.overflow.length).toBeGreaterThan(0);
    expect(plan.corners).toEqual([]);
  });

  it('plans corner stacks in menu mode', () => {
    const buttons = [
      btn('t1', { position: 'top-left' }),
      btn('t2', { position: 'top-left' }),
      btn('b1', { position: 'bottom-right' }),
    ];
    const plan = planToolbarLayout({
      buttons,
      menuMode: true,
      hostHeight: 200,
      availableWidth: 400,
      maxVisible: 1,
      reservedByCorner: {},
      menuUsedByCorner: {},
    });

    expect(plan.corners.length).toBeGreaterThan(0);
    expect(plan.corners.every((c) => c.hasChrome)).toBe(true);
    const topLeft = plan.corners.find((c) => c.position === 'top-left');
    expect(topLeft?.showMore).toBe(true);
    expect(topLeft?.prefer).toBe('start');
  });
});
