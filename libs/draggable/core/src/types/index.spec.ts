import { describe, expect, it } from 'vitest';
import {
  createEmptyBottom,
  createEmptyContainer,
  createEmptyDrawer,
  createEmptyItemGroup,
  createEmptySideBar,
  itemTypeToGroup,
} from './index';

describe('itemTypeToGroup', () => {
  it('maps known multi-show item types', () => {
    expect(itemTypeToGroup('item-modal')).toBe('modal');
    expect(itemTypeToGroup('item-float')).toBe('float');
    expect(itemTypeToGroup('item-popup')).toBe('popup');
  });

  it('defaults unknown / exclusive types to popup', () => {
    expect(itemTypeToGroup(undefined)).toBe('popup');
    expect(itemTypeToGroup('item-sidebar')).toBe('popup');
    expect(itemTypeToGroup('item-bottom')).toBe('popup');
    expect(itemTypeToGroup('other')).toBe('popup');
  });
});

describe('empty factories', () => {
  it('createEmptyItemGroup starts empty', () => {
    expect(createEmptyItemGroup()).toEqual({ items: [], show: [] });
  });

  it('createEmptyBottom is exclusive show', () => {
    expect(createEmptyBottom()).toEqual({ items: [], show: undefined });
  });

  it('createEmptySideBar has four locations', () => {
    const sideBar = createEmptySideBar();
    expect(Object.keys(sideBar).sort()).toEqual([
      'bottom',
      'left',
      'right',
      'top',
    ]);
    expect(sideBar.left).toEqual({ items: [], show: undefined });
  });

  it('createEmptyDrawer includes size', () => {
    const drawer = createEmptyDrawer();
    expect(drawer.right).toEqual({ items: [], size: 0, show: undefined });
  });

  it('createEmptyContainer wires groups and defaults', () => {
    const c = createEmptyContainer();
    expect(c.popup).toEqual({ items: [], show: [] });
    expect(c.modal.items).toEqual([]);
    expect(c.bottom).toEqual({ items: [], show: undefined });
    expect(c.isMobile).toBe(false);
    expect(c.width).toBe(0);
    expect(c.height).toBe(0);
    expect(c.actions).toEqual({});
    expect(c.layouts).toEqual({});
    expect(c.sideBar.left.items).toEqual([]);
    expect(c.drawer.left.size).toBe(0);
  });
});
