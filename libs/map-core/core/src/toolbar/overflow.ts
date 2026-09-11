import { MAP_BUTTON_SIZE_PX } from '../ui/map-button';
import type { MapControlButtonState } from './types';

/** Minimum side inset for the mobile toolbar row (keep in sync with `_toolbar.scss`). */
export const TOOLBAR_EDGE_INSET_PX = 10;

/** Width the icon row may use inside a map host (both edges reserved). */
export function toolbarAvailableWidth(
  hostWidth: number,
  inset = TOOLBAR_EDGE_INSET_PX,
): number {
  if (!(hostWidth > 0)) return 0;
  return Math.max(0, hostWidth - inset * 2);
}

export type ToolbarButtonGroup = {
  id: string;
  buttons: MapControlButtonState[];
  orientation: 'row' | 'column';
};

export function groupToolbarButtons(
  buttons: MapControlButtonState[],
): ToolbarButtonGroup[] {
  const map = new Map<string, MapControlButtonState[]>();
  for (const btn of buttons) {
    if (btn.visible === false) continue;
    const key = btn.group ?? btn.id;
    const list = map.get(key);
    if (list) list.push(btn);
    else map.set(key, [btn]);
  }
  return Array.from(map, ([id, grouped]) => ({
    id,
    buttons: grouped,
    orientation: grouped[0]?.orientation === 'row' ? 'row' : 'column',
  }));
}

/** How many icon buttons fit in the available row (before a More slot). */
export function maxVisibleToolbarButtons(
  availableWidth: number,
  buttonSize = MAP_BUTTON_SIZE_PX.medium,
): number {
  if (!(availableWidth > 0) || !(buttonSize > 0)) return Number.POSITIVE_INFINITY;
  const pad = 20;
  const slot = buttonSize + 1;
  return Math.max(1, Math.floor((availableWidth - pad) / slot));
}

/** Cap used by corner vertical budgets (half of map height). */
export const BUTTON_GROUP_OVERFLOW_FRACTION = 0.5;

/** Vertical gap between corner menu clusters (keep in sync with `_toolbar.scss`). */
export const TOOLBAR_STACK_GAP_PX = 10;

/**
 * How many stack bands fit in an already-resolved pixel budget.
 * Uses real stack gap (not `buttonSize + 1`). Returns `0` when nothing fits
 * (callers may still show a lone More when `maxVisible >= 1` after reserving).
 */
export function maxVisibleButtonsInStackHeight(
  budgetPx: number,
  buttonSize = MAP_BUTTON_SIZE_PX.medium,
  gapPx = TOOLBAR_STACK_GAP_PX,
): number {
  if (!(buttonSize > 0) || !(budgetPx >= buttonSize)) return 0;
  return Math.floor((budgetPx + gapPx) / (buttonSize + gapPx));
}

/**
 * Split a vertical map edge between top and bottom menu stacks.
 *
 * Each side is capped at half the map minus its own `controlLayout="button"`
 * chrome. **Unused** room in one half is given to the other side so a short
 * top stack does not starve the bottom (and vice versa).
 *
 * When bottom chrome alone fills the bottom half, bottom menu gets `0` and
 * top receives the remaining map above that chrome.
 */
export function cornerVerticalMenuBudgetsPx(options: {
  hostHeight: number;
  topReservedPx?: number;
  bottomReservedPx?: number;
  /** Measured height of the top menu stack (after layout). */
  topMenuUsedPx?: number;
  /** Measured height of the bottom menu stack (after layout). */
  bottomMenuUsedPx?: number;
  fraction?: number;
}): { topPx: number; bottomPx: number } {
  const hostHeight = options.hostHeight;
  if (!(hostHeight > 0)) return { topPx: 0, bottomPx: 0 };
  const fraction = options.fraction ?? BUTTON_GROUP_OVERFLOW_FRACTION;
  const half = hostHeight * fraction;
  const topR = Math.max(0, options.topReservedPx ?? 0);
  const bottomR = Math.max(0, options.bottomReservedPx ?? 0);

  if (bottomR >= half) {
    return {
      bottomPx: 0,
      topPx: Math.max(0, hostHeight - bottomR - topR),
    };
  }

  const topCap = Math.max(0, half - topR);
  const bottomCap = Math.max(0, half - bottomR);

  // Before first measure, assume the other side may use its full cap.
  const topUsed =
    options.topMenuUsedPx == null
      ? topCap
      : Math.min(Math.max(0, options.topMenuUsedPx), topCap);
  const bottomUsed =
    options.bottomMenuUsedPx == null
      ? bottomCap
      : Math.min(Math.max(0, options.bottomMenuUsedPx), bottomCap);

  // Own half-cap + leftover from the opposite half.
  const topPx = Math.min(
    topCap + Math.max(0, bottomCap - bottomUsed),
    Math.max(0, hostHeight - bottomR - topR - bottomUsed),
  );
  const bottomPx = Math.min(
    bottomCap + Math.max(0, topCap - topUsed),
    Math.max(0, hostHeight - bottomR - topR - topUsed),
  );

  return { topPx, bottomPx };
}

/** Outer box of an element including vertical/horizontal margins. */
export function elementOuterSize(el: {
  offsetWidth: number;
  offsetHeight: number;
}): { width: number; height: number } {
  let mt = 0;
  let mb = 0;
  let ml = 0;
  let mr = 0;
  if (
    typeof getComputedStyle === 'function' &&
    typeof Element !== 'undefined' &&
    el instanceof Element
  ) {
    const style = getComputedStyle(el);
    mt = parseFloat(style.marginTop) || 0;
    mb = parseFloat(style.marginBottom) || 0;
    ml = parseFloat(style.marginLeft) || 0;
    mr = parseFloat(style.marginRight) || 0;
  }
  return {
    width: el.offsetWidth + ml + mr,
    height: el.offsetHeight + mt + mb,
  };
}

type CornerMeasurableChild = {
  offsetWidth: number;
  offsetHeight: number;
  querySelector?: (selectors: string) => unknown;
};

function asCornerMeasurableChild(node: unknown): CornerMeasurableChild | null {
  if (!node || typeof node !== 'object') return null;
  const el = node as CornerMeasurableChild;
  if (typeof el.offsetWidth !== 'number' || typeof el.offsetHeight !== 'number') {
    return null;
  }
  return el;
}

/**
 * Space taken in a corner host by non-toolbar modules (`controlLayout="button"`
 * such as MouseCoordinatesControl). Skips toolbar corner hosts and overflow panels.
 */
export function measureCornerStandaloneReserved(
  cornerHost: { children?: ArrayLike<unknown> } | null | undefined,
): { width: number; height: number } {
  if (!cornerHost?.children) return { width: 0, height: 0 };
  let width = 0;
  let height = 0;
  for (const node of Array.from(cornerHost.children)) {
    const child = asCornerMeasurableChild(node);
    if (!child) continue;
    const classList = (child as { classList?: { contains(c: string): boolean } })
      .classList;
    if (classList?.contains('map-toolbar-overflow')) continue;
    if (
      child.querySelector?.(
        '.map-toolbar-corner, .map-toolbar-overflow',
      )
    ) {
      continue;
    }
    if (child.offsetWidth <= 0 && child.offsetHeight <= 0) continue;
    const size = elementOuterSize(child);
    height += size.height;
    width = Math.max(width, size.width);
  }
  return { width, height };
}

/**
 * Outer height of the menu stack host in a corner (`.map-toolbar-corner`).
 * Returns `undefined` when the menu host is not in the DOM yet so callers can
 * keep the conservative half-cap until the first real measure.
 */
export function measureCornerMenuUsedPx(
  cornerHost: { children?: ArrayLike<unknown> } | null | undefined,
): number | undefined {
  if (!cornerHost?.children) return undefined;
  let found = false;
  let height = 0;
  for (const node of Array.from(cornerHost.children)) {
    const child = asCornerMeasurableChild(node);
    if (!child?.querySelector?.('.map-toolbar-corner')) continue;
    found = true;
    if (child.offsetWidth <= 0 && child.offsetHeight <= 0) continue;
    height += elementOuterSize(child).height;
  }
  return found ? height : undefined;
}

export function splitToolbarOverflow(
  groups: ToolbarButtonGroup[],
  maxVisible: number,
): { visible: ToolbarButtonGroup[]; overflow: ToolbarButtonGroup[] } {
  const total = groups.reduce((n, g) => n + g.buttons.length, 0);
  if (!Number.isFinite(maxVisible) || total <= maxVisible) {
    return { visible: groups, overflow: [] };
  }

  const slots = Math.max(1, maxVisible - 1);
  const visible: ToolbarButtonGroup[] = [];
  const overflow: ToolbarButtonGroup[] = [];
  let used = 0;
  let rest = false;

  for (const group of groups) {
    if (rest) {
      overflow.push(group);
      continue;
    }
    const next = used + group.buttons.length;
    if (next <= slots) {
      visible.push(group);
      used = next;
      continue;
    }
    const remain = slots - used;
    if (remain > 0) {
      visible.push({
        id: group.id,
        orientation: group.orientation,
        buttons: group.buttons.slice(0, remain),
      });
      overflow.push({
        id: group.id,
        orientation: group.orientation,
        buttons: group.buttons.slice(remain),
      });
    } else {
      overflow.push(group);
    }
    rest = true;
  }

  return { visible, overflow };
}

/**
 * Which end of the stack stays visible when collapsing outside-in.
 * - `start`: keep leading groups (top-* corners — hide lower first)
 * - `end`: keep trailing groups (bottom-* corners — hide upper first)
 */
export type ToolbarOverflowPrefer = 'start' | 'end';

/** Vertical stack budget: a row cluster is one band; a column cluster is N buttons. */
export function toolbarGroupHeightCost(group: ToolbarButtonGroup): number {
  if (group.orientation === 'row') return 1;
  return Math.max(1, group.buttons.length);
}

/**
 * Like `splitToolbarOverflow`, but never splits a group: if a group does not
 * fit (including the More slot), whole clusters go to overflow from the
 * inner side (`prefer` keeps the outer edge). Slot cost uses vertical height
 * (`toolbarGroupHeightCost`) so wide row clusters (e.g. Measurement) are not
 * over-counted.
 *
 * When overflowing, reserves one band for More: `slots = maxVisible - 1`
 * (may be `0` → only More, no forced second button).
 */
export function splitToolbarOverflowKeepGroups(
  groups: ToolbarButtonGroup[],
  maxVisible: number,
  prefer: ToolbarOverflowPrefer = 'start',
): { visible: ToolbarButtonGroup[]; overflow: ToolbarButtonGroup[] } {
  if (prefer === 'end') {
    const reversed = [...groups].reverse();
    const split = splitToolbarOverflowKeepGroups(reversed, maxVisible, 'start');
    return {
      visible: [...split.visible].reverse(),
      overflow: [...split.overflow].reverse(),
    };
  }

  if (!Number.isFinite(maxVisible) || maxVisible <= 0) {
    return { visible: [], overflow: groups };
  }

  const total = groups.reduce((n, g) => n + toolbarGroupHeightCost(g), 0);
  if (total <= maxVisible) {
    return { visible: groups, overflow: [] };
  }

  // One band reserved for More — do not force a visible group when maxVisible=1.
  const slots = Math.max(0, maxVisible - 1);
  const visible: ToolbarButtonGroup[] = [];
  const overflow: ToolbarButtonGroup[] = [];
  let used = 0;
  let rest = false;

  for (const group of groups) {
    if (rest) {
      overflow.push(group);
      continue;
    }
    const next = used + toolbarGroupHeightCost(group);
    if (next <= slots) {
      visible.push(group);
      used = next;
      continue;
    }
    overflow.push(group);
    rest = true;
  }

  return { visible, overflow };
}
