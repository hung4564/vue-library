import { fitBounds, getMap } from '@hungpvq/map-core';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiCrosshairsGps,
  mdiCursorPointer,
  mdiFolderOutline,
  mdiFolderPlusOutline,
  mdiFormatLineStyle,
  mdiInformation,
} from '@mdi/js';
import type { BBox, Feature, Geometry } from 'geojson';
import type {
  IDataset,
  MenuAction,
  MenuActionLocation,
  MenuCondition,
  MenuConditionContext,
  MenuItemBottomOrExtra,
  MenuItemContentMenu,
  MenuItemCustomComponentBottomOrExtra,
  WithMenuHelper,
} from '../../interfaces';
import { convertItemToFeature, resolveDatasetBbox } from '../../utils';
import { getDatasetDetailInfo } from '../detail';
import type { FieldFeaturesDef } from '../field';
import { isIdentifyForListMenuHidden } from '../identify';
import {
  createMenuBuilder,
  createMenuClickAddComponentBuilder,
  createMenuClickBuilder,
  createMenuClickFitBoundsBuilder,
  createMenuClickHighlightBuilder,
} from './builder';
import { resolveMenuCondition } from './condition';

export const LIST_VIEW_MENU_ID = {
  moveUp: 'move-up',
  moveDown: 'move-down',
  addToGroup: 'add-to-group',
  addToExistingGroup: 'add-to-existing-group',
  exportGeo: 'export-geo',
  attributeTable: 'attribute-table',
  /** Identify feature detail menu (`createMenuItemShowDetailForItem`) */
  showDetail: 'show-detail',
  /** Toolbar / extra / bottom / prebottom */
  identify: 'identify-layer',
  /** Context menu row (must differ from `identify` so both can coexist) */
  identifyMenu: 'identify-layer-menu',
  /** Built-in menu click handlers (`registerMenuHandlerForMap`) */
  addComponent: 'addComponent',
  fitBounds: 'fitBounds',
  highlight: 'highlight',
} as const;

export const LIST_VIEW_MENU_COMPONENT_KEY = {
  addToGroup: 'layer-action-add-to-group',
  exportGeo: 'layer-action-export-geo',
  identify: 'layer-action-identify',
  toggleShow: 'layer-action-toggle-show',
  toggleShowButton: 'layer-action-toggle-show-button',
  setOpacity: 'layer-action-set-opacity',
  attributeTable: 'attribute-table',
  legendLinear: 'legend-linear',
  legendColor: 'legend-color',
  legendText: 'legend-text',
  legendMulti: 'legend-multi',
  layerIcon: 'layer-icon',
  layerDetail: 'layer-detail',
  styleControl: 'style-control',
  datasetDetail: 'dataset-detail',
  styleMultiControl: 'style-multi-control',
} as const;

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
      // Priority: props.bbox → bound part → metadata part → info.metadata.bbox
      const bbox = resolveDatasetBbox(layer, props?.bbox);
      if (!bbox) return;

      getMap(mapId, (map) => {
        // Convert BBox [minLng, minLat, maxLng, maxLat] to [[minLng, minLat], [maxLng, maxLat]]
        fitBounds(map, [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ]);
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
        .addTupleDynamic(LIST_VIEW_MENU_ID.fitBounds, ({ value }) => {
          if (!value || typeof value !== 'object') return undefined;
          const feature =
            'type' in value && (value as { type?: string }).type === 'Feature'
              ? (value as Feature)
              : convertItemToFeature(
                  value as {
                    id?: string | number;
                    geometry: Geometry;
                    [key: string]: unknown;
                  },
                );
          if (!feature?.geometry) return undefined;
          return {
            value: createMenuClickFitBoundsBuilder().setDetail(feature).build(),
          };
        })
        .addTupleDynamic(LIST_VIEW_MENU_ID.highlight, ({ value }) => {
          const { geometry, ...properties } = value || {};
          if (!geometry) return undefined;
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
    .setId(LIST_VIEW_MENU_ID.showDetail)
    .setIcon(mdiInformation)
    .setClick((props) => {
      return createMenuClickBuilder()
        .addTupleDynamic(LIST_VIEW_MENU_ID.addComponent, ({ value }) => ({
          value: createMenuClickAddComponentBuilder()
            .setComponentKey(LIST_VIEW_MENU_COMPONENT_KEY.layerDetail)
            .setAttr({
              item: value,
              fields,
              view: props.layer,
            })
            .setCheck('detail')
            .build(),
        }))
        .addTupleDynamic(LIST_VIEW_MENU_ID.highlight, ({ value }) => ({
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
        .addTupleDynamic(LIST_VIEW_MENU_ID.addComponent, ({ layer }) => {
          const detail = getDatasetDetailInfo(layer);
          if (detail.fields.length === 0) return undefined;
          return {
            value: createMenuClickAddComponentBuilder()
              .setComponentKey(LIST_VIEW_MENU_COMPONENT_KEY.layerDetail)
              .setAttr({
                item: detail.item,
                fields: detail.fields,
                view: layer,
              })
              .setCheck('detail')
              .build(),
          };
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
        .addTupleDynamic(LIST_VIEW_MENU_ID.addComponent, ({ layer }) => ({
          value: createMenuClickAddComponentBuilder()
            .setComponentKey(LIST_VIEW_MENU_COMPONENT_KEY.styleControl)
            .setAttr({ item: layer })
            .build(),
        }))
        .build(),
    )
    .setAdditional(menu)
    .build();
}

export function createMenuItemToggleShow(
  menu: Partial<
    Omit<MenuItemCustomComponentBottomOrExtra<IDataset>, 'click'>
  > = {},
) {
  return createMenuBuilder()
    .item()
    .setLocation('extra')
    .setName('ToggleShow')
    .setComponentKey(LIST_VIEW_MENU_COMPONENT_KEY.toggleShow)
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
    .setComponentKey(LIST_VIEW_MENU_COMPONENT_KEY.setOpacity)
    .setAdditional(menu)
    .build();
}

/** One id for identify menu placement (extra vs context menu). */
export function listViewIdentifyMenuId(
  location: MenuActionLocation = 'extra',
): string {
  return location === 'menu'
    ? LIST_VIEW_MENU_ID.identifyMenu
    : LIST_VIEW_MENU_ID.identify;
}

export type IdentifyForListMenuOptions = {
  location?: MenuActionLocation;
  name?: string;
  icon?: string;
  hidden?: MenuCondition;
  disabled?: MenuCondition;
  order?: number;
  class?: string;
};

export function createMenuItemIdentifyForList(
  options: IdentifyForListMenuOptions = {},
) {
  const location: MenuActionLocation = options.location ?? 'extra';
  const {
    name = 'Identify',
    icon = mdiCursorPointer,
    hidden,
    disabled,
    order,
    class: className,
  } = options;

  const builder = createMenuBuilder()
    .item()
    .setId(listViewIdentifyMenuId(location))
    .setLocation(location)
    .setName(name)
    .setIcon(icon)
    .setHidden((ctx: MenuConditionContext) => {
      if (isIdentifyForListMenuHidden(ctx)) return true;
      return resolveMenuCondition(hidden, ctx);
    })
    .setAdditional({
      ...(order != null ? { order } : {}),
      ...(className != null ? { class: className } : {}),
      ...(disabled != null ? { disabled } : {}),
    });

  if (location === 'menu') {
    return builder
      .setComponentMenuKey(LIST_VIEW_MENU_COMPONENT_KEY.identify)
      .build();
  }

  return builder.setComponentKey(LIST_VIEW_MENU_COMPONENT_KEY.identify).build();
}

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
    return !!(extra.readonly || extra.disabledMove || config?.disabled_move);
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
