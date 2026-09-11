import { describe, expect, it } from 'vitest';
import {
  BUTTON_GROUP_OVERFLOW_FRACTION,
  TOOLBAR_EDGE_INSET_PX,
  cornerVerticalMenuBudgetsPx,
  groupToolbarButtons,
  maxVisibleButtonsInStackHeight,
  maxVisibleToolbarButtons,
  measureCornerMenuUsedPx,
  measureCornerStandaloneReserved,
  splitToolbarOverflow,
  splitToolbarOverflowKeepGroups,
  toolbarAvailableWidth,
} from './overflow';
import type { MapControlButtonState } from './types';

function btn(
  id: string,
  extra: Partial<MapControlButtonState> = {},
): MapControlButtonState {
  return { id, action: () => undefined, ...extra };
}

describe('toolbar overflow', () => {
  it('groups visible buttons and skips hidden', () => {
    const groups = groupToolbarButtons([
      btn('a', { group: 'nav' }),
      btn('b', { group: 'nav' }),
      btn('c', { visible: false, group: 'nav' }),
      btn('d'),
    ]);
    expect(groups.map((g) => g.id)).toEqual(['nav', 'd']);
    expect(groups[0].buttons.map((b) => b.id)).toEqual(['a', 'b']);
  });

  it('keeps all groups when they fit', () => {
    const groups = [
      { id: 'a', orientation: 'column' as const, buttons: [btn('a1')] },
      {
        id: 'b',
        orientation: 'row' as const,
        buttons: [btn('b1'), btn('b2')],
      },
    ];
    const split = splitToolbarOverflow(groups, 5);
    expect(split.visible).toEqual(groups);
    expect(split.overflow).toEqual([]);
  });

  it('reserves a More slot and keeps group order when overflowing', () => {
    const groups = [
      {
        id: 'a',
        orientation: 'column' as const,
        buttons: [btn('a1'), btn('a2')],
      },
      {
        id: 'b',
        orientation: 'row' as const,
        buttons: [btn('b1'), btn('b2'), btn('b3')],
      },
    ];
    const split = splitToolbarOverflow(groups, 4);
    expect(split.visible.map((g) => g.buttons.map((b) => b.id))).toEqual([
      ['a1', 'a2'],
      ['b1'],
    ]);
    expect(split.overflow.map((g) => g.buttons.map((b) => b.id))).toEqual([
      ['b2', 'b3'],
    ]);
  });

  it('never splits a group when using keep-groups overflow', () => {
    const groups = [
      {
        id: 'a',
        orientation: 'column' as const,
        buttons: [btn('a1'), btn('a2')],
      },
      {
        id: 'b',
        orientation: 'row' as const,
        buttons: [btn('b1'), btn('b2'), btn('b3')],
      },
      { id: 'c', orientation: 'column' as const, buttons: [btn('c1')] },
    ];
    // Vertical budget: row cluster costs 1 → slots=2 keeps only a(2)
    const split = splitToolbarOverflowKeepGroups(groups, 3);
    expect(split.visible.map((g) => g.buttons.map((b) => b.id))).toEqual([
      ['a1', 'a2'],
    ]);
    expect(split.overflow.map((g) => g.buttons.map((b) => b.id))).toEqual([
      ['b1', 'b2', 'b3'],
      ['c1'],
    ]);
  });

  it('keeps trailing groups when prefer is end (bottom corners)', () => {
    const groups = [
      {
        id: 'a',
        orientation: 'column' as const,
        buttons: [btn('a1'), btn('a2')],
      },
      {
        id: 'b',
        orientation: 'row' as const,
        buttons: [btn('b1'), btn('b2'), btn('b3')],
      },
      { id: 'c', orientation: 'column' as const, buttons: [btn('c1')] },
    ];
    const split = splitToolbarOverflowKeepGroups(groups, 3, 'end');
    expect(split.visible.map((g) => g.buttons.map((b) => b.id))).toEqual([
      ['b1', 'b2', 'b3'],
      ['c1'],
    ]);
    expect(split.overflow.map((g) => g.buttons.map((b) => b.id))).toEqual([
      ['a1', 'a2'],
    ]);
  });

  it('counts a row cluster as one height band so Measurement stays visible', () => {
    const groups = [
      {
        id: 'measure',
        orientation: 'row' as const,
        buttons: [btn('d'), btn('a'), btn('az'), btn('p')],
      },
      {
        id: 'draw',
        orientation: 'row' as const,
        buttons: [btn('line'), btn('poly')],
      },
      { id: 'info', orientation: 'column' as const, buttons: [btn('info')] },
    ];
    // Without row costing 1, measure(4) alone would blow a budget of 2.
    const split = splitToolbarOverflowKeepGroups(groups, 2);
    expect(split.visible.map((g) => g.id)).toEqual(['measure']);
    expect(split.overflow.map((g) => g.id)).toEqual(['draw', 'info']);
  });

  it('records cluster orientation from the first button', () => {
    const groups = groupToolbarButtons([
      btn('a', { group: 'nav', orientation: 'column' }),
      btn('b', { group: 'nav', orientation: 'column' }),
      btn('c', { group: 'measure', orientation: 'row' }),
    ]);
    expect(groups.map((g) => g.orientation)).toEqual(['column', 'row']);
  });

  it('computes how many buttons fit in a narrow row', () => {
    expect(maxVisibleToolbarButtons(0)).toBe(Number.POSITIVE_INFINITY);
    expect(maxVisibleToolbarButtons(120, 32)).toBeGreaterThanOrEqual(1);
    expect(maxVisibleToolbarButtons(120, 32)).toBeLessThan(
      maxVisibleToolbarButtons(400, 32),
    );
  });

  it('counts stack bands with real gap; returns 0 when nothing fits', () => {
    expect(maxVisibleButtonsInStackHeight(0, 32)).toBe(0);
    expect(maxVisibleButtonsInStackHeight(31, 32)).toBe(0);
    expect(maxVisibleButtonsInStackHeight(32, 32)).toBe(1);
    expect(maxVisibleButtonsInStackHeight(32 + 10 + 32, 32, 10)).toBe(2);
    // half-height helper stays aligned with BUTTON_GROUP_OVERFLOW_FRACTION
    expect(
      maxVisibleButtonsInStackHeight(320 * BUTTON_GROUP_OVERFLOW_FRACTION, 32),
    ).toBeGreaterThanOrEqual(1);
  });

  it('keep-groups may show only More when maxVisible is 1', () => {
    const groups = [
      { id: 'a', orientation: 'column' as const, buttons: [btn('a1')] },
      { id: 'b', orientation: 'column' as const, buttons: [btn('b1')] },
    ];
    const split = splitToolbarOverflowKeepGroups(groups, 1);
    expect(split.visible).toEqual([]);
    expect(split.overflow.map((g) => g.id)).toEqual(['a', 'b']);
  });

  it('keep-groups puts everything in overflow when maxVisible is 0', () => {
    const groups = [
      { id: 'a', orientation: 'column' as const, buttons: [btn('a1')] },
    ];
    const split = splitToolbarOverflowKeepGroups(groups, 0);
    expect(split.visible).toEqual([]);
    expect(split.overflow.map((g) => g.id)).toEqual(['a']);
  });

  it('fits bottom menu beside button chrome; unused top half goes to bottom', () => {
    expect(
      cornerVerticalMenuBudgetsPx({
        hostHeight: 800,
        topReservedPx: 0,
        bottomReservedPx: 100,
      }),
    ).toEqual({ bottomPx: 300, topPx: 400 });
    expect(
      cornerVerticalMenuBudgetsPx({
        hostHeight: 800,
        topReservedPx: 40,
        bottomReservedPx: 100,
      }),
    ).toEqual({ bottomPx: 300, topPx: 360 });
    expect(
      cornerVerticalMenuBudgetsPx({
        hostHeight: 800,
        topReservedPx: 0,
        bottomReservedPx: 500,
      }),
    ).toEqual({ bottomPx: 0, topPx: 300 });
    // Short top stack → leftover half is available to bottom.
    expect(
      cornerVerticalMenuBudgetsPx({
        hostHeight: 800,
        topReservedPx: 0,
        bottomReservedPx: 100,
        topMenuUsedPx: 50,
        bottomMenuUsedPx: 120,
      }),
    ).toEqual({ bottomPx: 650, topPx: 580 });
    expect(cornerVerticalMenuBudgetsPx({ hostHeight: 0 })).toEqual({
      topPx: 0,
      bottomPx: 0,
    });
  });

  it('measures menu stack height when present; undefined when missing', () => {
    expect(measureCornerMenuUsedPx(null)).toBeUndefined();
    expect(measureCornerMenuUsedPx({ children: [] })).toBeUndefined();
    const coords = {
      offsetWidth: 120,
      offsetHeight: 90,
      querySelector: () => null,
    };
    const toolbar = {
      offsetWidth: 40,
      offsetHeight: 200,
      querySelector: (sel: string) =>
        sel.includes('.map-toolbar-corner') ? {} : null,
    };
    expect(
      measureCornerMenuUsedPx({ children: [coords, toolbar] }),
    ).toBe(200);
  });

  it('measures standalone chrome in a corner host excluding toolbar corners', () => {
    const coords = {
      offsetWidth: 120,
      offsetHeight: 90,
      querySelector: () => null,
    };
    const toolbar = {
      offsetWidth: 40,
      offsetHeight: 200,
      querySelector: (sel: string) =>
        sel.includes('.map-toolbar-corner') ? {} : null,
    };
    const overflow = {
      offsetWidth: 200,
      offsetHeight: 80,
      classList: { contains: (c: string) => c === 'map-toolbar-overflow' },
      querySelector: () => null,
    };
    const host = { children: [coords, toolbar, overflow] };
    expect(measureCornerStandaloneReserved(host)).toEqual({
      width: 120,
      height: 90,
    });
  });

  it('reserves even edge insets from the map host width', () => {
    expect(toolbarAvailableWidth(0)).toBe(0);
    expect(toolbarAvailableWidth(400)).toBe(400 - TOOLBAR_EDGE_INSET_PX * 2);
  });
});
