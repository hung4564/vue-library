import type { MenuAction } from '../interfaces/dataset.parts';
import { createMenuConditionContext } from './condition';
import { partitionMenuActions, mergeMenusById } from './location';
import {
  MENU_CONTROL_ID,
  applyMenuControlPlacement,
} from './placement';

describe('partitionMenuActions', () => {
  const menus: MenuAction[] = [
    {
      type: 'item',
      location: 'menu',
      id: 'm1',
      name: 'Menu',
      order: 2,
      click: () => undefined,
    },
    {
      type: 'item',
      id: 'e1',
      icon: 'x',
      order: 1,
      click: () => undefined,
    },
    {
      type: 'item',
      location: 'title',
      id: 't1',
      icon: 'y',
      order: 0,
      click: () => undefined,
    },
    {
      type: 'item',
      location: 'bottom',
      id: 'b1',
      icon: 'z',
      click: () => undefined,
    },
    {
      type: 'item',
      location: 'prebottom',
      id: 'p1',
      componentKey: 'k',
    } as MenuAction,
  ];

  it('buckets by location (unset → extra)', () => {
    const p = partitionMenuActions(menus);
    expect(p.extra.map((m) => m.id)).toEqual(['e1']);
    expect(p.menu.map((m) => m.id)).toEqual(['m1']);
    expect(p.title.map((m) => m.id)).toEqual(['t1']);
    expect(p.bottom.map((m) => m.id)).toEqual(['b1']);
    expect(p.prebottom.map((m) => m.id)).toEqual(['p1']);
  });

  it('filters hidden when ctx provided', () => {
    const withHidden: MenuAction[] = [
      {
        type: 'item',
        id: 'vis',
        icon: 'a',
        click: () => undefined,
      },
      {
        type: 'item',
        id: 'hid',
        icon: 'b',
        hidden: true,
        click: () => undefined,
      },
    ];
    const p = partitionMenuActions(withHidden, {
      layer: {} as never,
    });
    expect(p.extra.map((m) => m.id)).toEqual(['vis']);
  });

  it('applies byControl location and hidden from context.control', () => {
    const menusWithControl: MenuAction[] = [
      {
        type: 'item',
        id: 'fly',
        icon: 'a',
        location: 'extra',
        byControl: {
          [MENU_CONTROL_ID.layerDetail]: { location: 'title' },
        },
        click: () => undefined,
      },
      {
        type: 'item',
        id: 'detail',
        icon: 'b',
        location: 'menu',
        name: 'Detail',
        byControl: {
          [MENU_CONTROL_ID.layerDetail]: { hidden: true },
        },
        click: () => undefined,
      },
    ];
    const detailCtx = createMenuConditionContext({} as never, {
      context: [{ control: MENU_CONTROL_ID.layerDetail }],
    });
    const layerCtx = createMenuConditionContext({} as never, {
      context: [{ control: MENU_CONTROL_ID.layerControl }],
    });

    const onDetail = partitionMenuActions(menusWithControl, detailCtx);
    expect(onDetail.title.map((m) => m.id)).toEqual(['fly']);
    expect(onDetail.extra).toHaveLength(0);
    expect(onDetail.menu).toHaveLength(0);

    const onLayer = partitionMenuActions(menusWithControl, layerCtx);
    expect(onLayer.extra.map((m) => m.id)).toEqual(['fly']);
    expect(onLayer.menu.map((m) => m.id)).toEqual(['detail']);
    expect(onLayer.title).toHaveLength(0);
  });
});

describe('applyMenuControlPlacement', () => {
  it('no-ops without matching control', () => {
    const menu: MenuAction = {
      type: 'item',
      id: 'x',
      icon: 'a',
      location: 'extra',
      byControl: { 'layer-detail': { location: 'title' } },
      click: () => undefined,
    };
    expect(applyMenuControlPlacement(menu)).toBe(menu);
    expect(
      applyMenuControlPlacement(
        menu,
        createMenuConditionContext({} as never, {
          context: [{ control: 'identify' }],
        }),
      ),
    ).toMatchObject({ location: 'extra' });
  });
});

describe('mergeMenusById', () => {
  it('keeps first id and appends anonymous', () => {
    const a: MenuAction[] = [
      { type: 'item', id: 'x', icon: 'a', click: () => undefined },
      { type: 'item', icon: 'anon1', click: () => undefined },
    ];
    const b: MenuAction[] = [
      { type: 'item', id: 'x', icon: 'b', click: () => undefined },
      { type: 'item', icon: 'anon2', click: () => undefined },
    ];
    const merged = mergeMenusById([a, b]);
    expect(merged).toHaveLength(3);
    expect(merged[0]).toMatchObject({ id: 'x', icon: 'a' });
  });
});
