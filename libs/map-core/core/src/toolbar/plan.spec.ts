import { describe, expect, it, vi } from 'vitest';

import { groupToolbarButtons } from './overflow';
import {
  handleToolbarButtonClick,
  planToolbarExpansion,
  planToolbarLayout,
  shouldCloseExpandedOnOutsideClick,
} from './plan';
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

describe('planToolbarExpansion', () => {
  it('keeps launcher on primary and options on secondary when expanded', () => {
    const buttons = [
      btn('theme:launcher', {
        group: 'theme',
        expandable: true,
        role: 'launcher',
      }),
      btn('theme:dark', { group: 'theme', expandable: true, role: 'option' }),
      btn('home', { order: 1 }),
    ];
    const groups = groupToolbarButtons(buttons);

    const collapsed = planToolbarExpansion(groups, null);
    expect(collapsed.primaryGroups.map((g) => g.id).sort()).toEqual([
      'home',
      'theme',
    ]);
    expect(
      collapsed.primaryGroups
        .find((g) => g.id === 'theme')
        ?.buttons.map((b) => b.id),
    ).toEqual(['theme:launcher']);
    expect(collapsed.secondaryButtons).toEqual([]);

    const expanded = planToolbarExpansion(groups, 'theme');
    expect(expanded.secondaryButtons.map((b) => b.id)).toEqual(['theme:dark']);
  });
});

describe('handleToolbarButtonClick', () => {
  it('toggles expandable launcher and runs action for options', () => {
    const toggle = vi.fn();
    const action = vi.fn();
    handleToolbarButtonClick(
      btn('theme:launcher', {
        group: 'theme',
        expandable: true,
        role: 'launcher',
      }),
      { stopPropagation: vi.fn() } as unknown as MouseEvent,
      { toggleExpandedModule: toggle },
    );
    expect(toggle).toHaveBeenCalledWith('theme');

    handleToolbarButtonClick(
      { ...btn('theme:dark', { role: 'option', expandable: true }), action },
      {} as MouseEvent,
      { toggleExpandedModule: toggle },
    );
    expect(action).toHaveBeenCalled();
    expect(toggle).toHaveBeenCalledTimes(1);
  });
});

describe('shouldCloseExpandedOnOutsideClick', () => {
  it('defaults to true and respects launcher closeOnOutsideClick false', () => {
    expect(shouldCloseExpandedOnOutsideClick([], 'theme')).toBe(true);

    const open = [
      btn('theme:launcher', {
        group: 'theme',
        role: 'launcher',
        expandable: true,
        closeOnOutsideClick: false,
      }),
    ];
    expect(shouldCloseExpandedOnOutsideClick(open, 'theme')).toBe(false);
    expect(shouldCloseExpandedOnOutsideClick(open, null)).toBe(false);
  });
});
