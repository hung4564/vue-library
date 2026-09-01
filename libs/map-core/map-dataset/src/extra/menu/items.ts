import { fitBounds, getMap } from '@hungpvq/map-core';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiCrosshairsGps,
  mdiFolderOutline,
  mdiFolderPlusOutline,
  mdiFormatLineStyle,
  mdiInformation,
} from '@mdi/js';
import type { BBox } from 'geojson';
import type {
  IDataset,
  IMapboxSourceView,
  IMetadataView,
  MenuAction,
  MenuConditionContext,
  MenuItemBottomOrExtra,
  MenuItemContentMenu,
  MenuItemCustomComponentBottomOrExtra,
  WithMenuHelper,
} from '../../interfaces';
import { findSiblingOrNearestLeaf } from '../../model/visitors';
import { convertItemToFeature } from '../../utils';
import type { FieldFeaturesDef } from '../field';
import {
  createMenuBuilder,
  createMenuClickAddComponentBuilder,
  createMenuClickBuilder,
  createMenuClickHighlightBuilder,
} from './builder';

export function createWithMenuHelper<
  T extends IDataset = IDataset,
>(): WithMenuHelper<T> {
  const menus: MenuAction<T>[] = [];
  return {
    getMenus() {
      return menus;
    },
    addMenu(menu: MenuAction<T>) {
      if (menu.id && menus.some((m) => m.id === menu.id)) {
        return;
      }
      menus.push(menu);
    },
    addMenus(menusToAdd: MenuAction<T>[]) {
      for (const menu of menusToAdd) {
        if (menu.id && menus.some((m) => m.id === menu.id)) continue;

        menus.push(menu);
      }
    },
    removeMenu(id: string) {
      const index = menus.findIndex((m) => m.id === id);
      if (index !== -1) {
        menus.splice(index, 1);
      }
    },
    getMenu(id: string): MenuAction<T> | undefined {
      return menus.find((m) => m.id === id);
    },

    hasMenu(id: string): boolean {
      return menus.some((m) => m.id === id);
    },

    updateMenu(id: string, updater: (menu: MenuAction<T>) => MenuAction<T>) {
      const index = menus.findIndex((m) => m.id === id);
      if (index !== -1) {
        menus[index] = updater(menus[index]);
      }
    },
  };
}
export function createMenuItem<T extends IDataset>(
  item: MenuItemBottomOrExtra<T> | MenuItemCustomComponentBottomOrExtra<T>,
): MenuAction<T> {
  return item;
}

export function createMenuItemToBoundActionForList(props?: {
  bbox?: BBox;
  name?: string;
}) {
  return createMenuBuilder()
    .item()
    .setId('fill-bound')
    .setLocation('extra')
    .setName(props?.name ?? 'Fill bound')
    .setIcon(mdiCrosshairsGps)
    .setClick(({ layer, mapId }) => {
      if (props?.bbox) {
        getMap(mapId, (map) => {
          if (props?.bbox) {
            // Convert BBox [minLng, minLat, maxLng, maxLat] to [[minLng, minLat], [maxLng, maxLat]]
            const bbox = props.bbox;
            if (bbox.length >= 4) {
              fitBounds(map, [
                [bbox[0], bbox[1]],
                [bbox[2], bbox[3]],
              ]);
            }
          }
        });
        return;
      }
      const metadata = findSiblingOrNearestLeaf(
        layer,
        (dataset) => dataset.type === 'metadata',
      ) as IMetadataView;

      getMap(mapId, (map) => {
        const bbox = metadata?.metadata?.bbox;
        if (bbox && bbox.length >= 4) {
          // Convert BBox [minLng, minLat, maxLng, maxLat] to [[minLng, minLat], [maxLng, maxLat]]
          fitBounds(map, [
            [bbox[0], bbox[1]],
            [bbox[2], bbox[3]],
          ]);
        }
      });
    })
    .build();
}

export function createMenuItemToBoundActionForItem() {
  return createMenuBuilder() // = kiểu layer, bạn thay đúng type nếu có
    .item()
    .setLocation('menu')
    .setName('Fly to')
    .setIcon(mdiCrosshairsGps)
    .setClick(
      createMenuClickBuilder()
        .addTupleDynamic('fitBounds', ({ value }) => ({
          value: value?.geometry,
        }))
        .addTupleDynamic('highlight', ({ value }) => {
          const { geometry, ...properties } = value || {};
          return {
            value: createMenuClickHighlightBuilder()
              .setDetail({
                type: 'Feature',
                geometry,
                properties,
              })
              .setKey('identify')
              .build(),
          };
        })
        .build(),
    )
    .build();
}
export function createMenuItemShowDetailForItem(fields: FieldFeaturesDef) {
  return createMenuBuilder()
    .item()
    .setLocation('menu')
    .setName('Detail')
    .setId('show-detail')
    .setIcon(mdiInformation)
    .setClick((props) => {
      return createMenuClickBuilder()
        .addTupleDynamic('addComponent', ({ value }) => ({
          value: createMenuClickAddComponentBuilder()
            .setComponentKey('layer-detail')
            .setAttr({
              item: value,
              fields,
              view: props.layer,
            })
            .setCheck('detail')
            .build(),
        }))
        .addTupleDynamic('highlight', ({ value }) => ({
          value: createMenuClickHighlightBuilder()
            .setDetail(convertItemToFeature(value))
            .setKey('detail')
            .build(),
        }));
    })
    .build();
}

export function createMenuItemShowDetailInfoSource(
  menu: Partial<Omit<MenuItemBottomOrExtra<IDataset>, 'click'>> = {},
) {
  return createMenuBuilder()
    .item()
    .setName('Info')
    .setIcon(mdiInformation)
    .setClick(
      createMenuClickBuilder()
        .addTupleDynamic('addComponent', ({ layer }) => {
          const source = findSiblingOrNearestLeaf(
            layer,
            (dataset) => dataset.type === 'source',
          ) as IMapboxSourceView | null;
          if (source) {
            return {
              value: createMenuClickAddComponentBuilder()
                .setComponentKey('layer-detail')
                .setAttr({
                  item: source.getDataInfo(),
                  fields: source.getFieldsInfo(),
                  view: layer,
                })
                .setCheck('detail')
                .build(),
            };
          }
          return undefined;
        })
        .build(),
    )
    .setAdditional(menu)
    .build();
}
export function createMenuItemStyleEdit(
  menu: Partial<Omit<MenuItemBottomOrExtra<IDataset>, 'click'>> = {},
) {
  return createMenuBuilder()
    .item()
    .setName('Edit style')
    .setIcon(mdiFormatLineStyle)
    .setClick(
      createMenuClickBuilder()
        .addTupleDynamic('addComponent', ({ layer }) => ({
          value: createMenuClickAddComponentBuilder()
            .setComponentKey('style-control')
            .setAttr({ item: layer })
            .build(),
        }))
        .build(),
    )
    .setAdditional(menu)
    .build();
}

export function createMenuItemToggleShow(
  menu: Partial<Omit<MenuItemBottomOrExtra<IDataset>, 'click'>> = {},
) {
  return createMenuBuilder()
    .item()
    .setLocation('extra')
    .setName('ToggleShow')
    .setComponentKey('layer-action-toggle-show')
    .setAdditional(menu)
    .build();
}

export function createMenuItemSetOpacity(
  menu: Partial<Omit<MenuItemBottomOrExtra<IDataset>, 'click'>> = {},
) {
  return createMenuBuilder()
    .item()
    .setLocation('prebottom')
    .setName('SetOpacity')
    .setComponentKey('layer-action-set-opacity')
    .setAdditional(menu)
    .build();
}

export const LIST_VIEW_MENU_ID = {
  moveUp: 'move-up',
  moveDown: 'move-down',
  addToGroup: 'add-to-group',
  addToExistingGroup: 'add-to-existing-group',
  exportGeo: 'export-geo',
  attributeTable: 'attribute-table',
} as const;

export const LIST_VIEW_MENU_COMPONENT_KEY = {
  addToGroup: 'layer-action-add-to-group',
  exportGeo: 'layer-action-export-geo',
} as const;

export type ListViewGroupOption = { id: string; name: string };

export function isMenuItemCustomComponent(
  menu: MenuAction,
): menu is MenuItemContentMenu & { componentMenuKey: string } {
  return (
    menu.type === 'item' &&
    typeof (menu as MenuItemContentMenu).componentMenuKey === 'string' &&
    !!(menu as MenuItemContentMenu).componentMenuKey
  );
}

export function createAddToGroupSubmenu(
  groups: ListViewGroupOption[],
  excludeGroupId?: string,
): MenuAction[] {
  const children: MenuAction[] = [
    {
      type: 'item',
      location: 'menu',
      id: `${LIST_VIEW_MENU_ID.addToGroup}:new`,
      name: 'New group',
      icon: mdiFolderPlusOutline,
      click: LIST_VIEW_MENU_ID.addToGroup,
    },
  ];
  const others = groups.filter((group) => group.id !== excludeGroupId);
  if (others.length === 0) return children;

  children.push({ type: 'divider', location: 'menu' });
  for (const group of others) {
    children.push({
      type: 'item',
      location: 'menu',
      id: `${LIST_VIEW_MENU_ID.addToExistingGroup}:${group.id}`,
      name: group.name || 'Group',
      icon: mdiFolderOutline,
      click: createMenuClickBuilder()
        .addTupleStatic(LIST_VIEW_MENU_ID.addToExistingGroup, {
          meta: { groupId: group.id, groupName: group.name },
        })
        .build(),
    });
  }
  return children;
}

export function createMenuItemMoveUp(
  menu: Partial<Omit<MenuItemBottomOrExtra<IDataset>, 'click'>> = {},
) {
  return createMenuBuilder()
    .item()
    .setLocation('menu')
    .setId(LIST_VIEW_MENU_ID.moveUp)
    .setName('Move up')
    .setIcon(mdiChevronUp)
    .setClick(LIST_VIEW_MENU_ID.moveUp)
    .setHidden((ctx) =>
      isListViewReorderMenuHidden(LIST_VIEW_MENU_ID.moveUp, ctx),
    )
    .setAdditional({ order: 20, ...menu })
    .build();
}

export function createMenuItemMoveDown(
  menu: Partial<Omit<MenuItemBottomOrExtra<IDataset>, 'click'>> = {},
) {
  return createMenuBuilder()
    .item()
    .setLocation('menu')
    .setId(LIST_VIEW_MENU_ID.moveDown)
    .setName('Move down')
    .setIcon(mdiChevronDown)
    .setClick(LIST_VIEW_MENU_ID.moveDown)
    .setHidden((ctx) =>
      isListViewReorderMenuHidden(LIST_VIEW_MENU_ID.moveDown, ctx),
    )
    .setAdditional({ order: 21, ...menu })
    .build();
}

export function createMenuItemAddToGroup(
  menu: Partial<Omit<MenuItemBottomOrExtra<IDataset>, 'click'>> = {},
) {
  return createMenuBuilder()
    .item()
    .setLocation('menu')
    .setId(LIST_VIEW_MENU_ID.addToGroup)
    .setName('Add to group')
    .setIcon(mdiFolderPlusOutline)
    .setComponentMenuKey(LIST_VIEW_MENU_COMPONENT_KEY.addToGroup)
    .setHidden((ctx) =>
      isListViewReorderMenuHidden(LIST_VIEW_MENU_ID.addToGroup, ctx),
    )
    .setAdditional({
      order: 22,
      ...menu,
    })
    .build();
}

export function isListViewReorderMenuHidden(
  menuId: string | undefined,
  ctx: MenuConditionContext,
): boolean {
  if (!menuId) return false;
  const extra = (ctx.context ?? {}) as {
    readonly?: boolean;
    disabledMove?: boolean;
    disabledCreateGroup?: boolean;
  };
  const config = (
    ctx.layer as {
      config?: { disabled_move?: boolean; disabled_add_to_group?: boolean };
    }
  )?.config;
  if (
    menuId === LIST_VIEW_MENU_ID.moveUp ||
    menuId === LIST_VIEW_MENU_ID.moveDown
  ) {
    return !!(
      extra.readonly ||
      extra.disabledMove ||
      config?.disabled_move
    );
  }
  if (menuId === LIST_VIEW_MENU_ID.addToGroup) {
    return !!(
      extra.readonly ||
      extra.disabledCreateGroup ||
      config?.disabled_add_to_group
    );
  }
  return false;
}
