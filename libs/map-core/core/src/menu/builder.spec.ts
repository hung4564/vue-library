import { describe, expect, it, vi } from 'vitest';
import { createMapMenuBuilder } from './builder';

describe('createMapMenuBuilder', () => {
  it('builds divider, header, and item fluently', () => {
    const divider = createMapMenuBuilder()
      .divider()
      .setId('d1')
      .setHidden(true)
      .build();
    expect(divider).toEqual({ type: 'divider', id: 'd1', hidden: true });

    const header = createMapMenuBuilder()
      .header()
      .setId('h1')
      .setName('Quick')
      .build();
    expect(header).toMatchObject({ type: 'header', id: 'h1', name: 'Quick' });

    const click = vi.fn();
    const item = createMapMenuBuilder()
      .item()
      .setId('i1')
      .setName('Copy')
      .setIcon('icon')
      .setClick(click)
      .setDisabled(false)
      .setChildren([])
      .build();
    expect(item).toMatchObject({
      type: 'item',
      id: 'i1',
      name: 'Copy',
      icon: 'icon',
      location: 'menu',
    });
    expect(item.click).toBe(click);
  });
});
