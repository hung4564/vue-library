import { describe, expect, it, vi } from 'vitest';
import {
  createMapMenuItemProps,
  filterVisibleMapMenuItems,
  handleMapMenuAction,
  resolveMapMenuCondition,
} from './handle';
import type { MapContextMenuTarget } from './types';

const target = {
  mapId: 'm1',
  lngLat: { lng: 1, lat: 2 },
} as MapContextMenuTarget;

describe('map-context-menu handle', () => {
  it('resolveMapMenuCondition handles boolean and function', () => {
    expect(resolveMapMenuCondition(undefined, target)).toBe(false);
    expect(resolveMapMenuCondition(true, target)).toBe(true);
    expect(resolveMapMenuCondition(() => true, target)).toBe(true);
    expect(resolveMapMenuCondition(() => false, target)).toBe(false);
  });

  it('filterVisibleMapMenuItems drops hidden and recurses children', () => {
    const items = filterVisibleMapMenuItems(
      [
        { type: 'item', name: 'a', hidden: true },
        {
          type: 'item',
          name: 'b',
          children: [
            { type: 'item', name: 'b1', hidden: true },
            { type: 'item', name: 'b2' },
          ],
        },
      ],
      target,
    );
    expect(items).toHaveLength(1);
    expect((items[0] as any).children).toEqual([{ type: 'item', name: 'b2' }]);
  });

  it('handleMapMenuAction invokes click unless disabled', () => {
    const click = vi.fn();
    const props = createMapMenuItemProps(target);
    handleMapMenuAction(
      { type: 'item', name: 'x', disabled: true, click },
      props,
    );
    expect(click).not.toHaveBeenCalled();

    handleMapMenuAction({ type: 'item', name: 'x', click }, props);
    expect(click).toHaveBeenCalledWith(props);
  });
});
