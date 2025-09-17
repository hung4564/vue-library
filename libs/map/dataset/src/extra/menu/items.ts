import { fitBounds } from '@hungpvq/shared-map';
import { getMap } from '@hungpvq/vue-map-core';
import { mdiCrosshairsGps, mdiFormatLineStyle, mdiInformation } from '@mdi/js';
import type {
  IDataManagementView,
  IDataset,
  IMapboxSourceView,
  IMetadataView,
  MenuAction,
  MenuItemBottomOrExtra,
  MenuItemCustomComponentBottomOrExtra,
  WithMenuHelper,
} from '../../interfaces';
import { findSiblingOrNearestLeaf } from '../../model/visitors';
import { convertItemToFeature } from '../../utils/convert';
import type { FieldFeaturesDef } from '../field';
import { handleMenuActionClick } from './handle';

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

export function createMenuItemToBoundActionForList() {
  return createMenuItem({
    location: 'extra',
    type: 'item',
    name: 'Fly to',
    icon: mdiCrosshairsGps,
    click: (layer, mapId) => {
      const metadata = findSiblingOrNearestLeaf(
        layer,
        (dataset) => dataset.type == 'metadata',
      ) as IMetadataView;
      getMap(mapId, (map) => {
        fitBounds(map, metadata?.metadata?.bbox);
      });
    },
  });
}

export function createMenuItemToBoundActionForItem() {
  return createMenuItem({
    type: 'item',
    name: 'Fly to',
    icon: mdiCrosshairsGps,
    click: [
      ['fitBounds', (layer, mapId, value) => [layer, mapId, value.geometry]],
      [
        'highlight',
        (layer, mapId, value) => {
          const { geometry, ...properties } = value;
          return [
            layer,
            mapId,
            {
              detail: {
                type: 'Feature',
                geometry,
                properties,
              },
              key: 'identify',
            },
          ];
        },
      ],
    ],
  });
}
export function createMenuItemShowDetailForItem(fields: FieldFeaturesDef = []) {
  return createMenuItem({
    type: 'item',
    name: 'Detail',
    id: 'show-detail',
    icon: mdiInformation,
    click: (layer, mapId, value) => {
      if (fields && fields.length > 0) {
        handleMenuActionClick(
          [
            [
              'addComponent',
              [
                layer,
                mapId,
                {
                  componentKey: 'layer-detail',
                  attr: {
                    item: value,
                    fields: fields,
                    view: layer,
                  },
                  check: 'detail',
                },
              ],
            ],
            [
              'highlight',
              [
                layer,
                mapId,
                {
                  detail: convertItemToFeature(value),
                  key: 'detail',
                },
              ],
            ],
          ],
          layer,
          mapId,
          value,
        );
        return;
      }
      const dataManagement = findSiblingOrNearestLeaf(
        layer,
        (dataset) => dataset.type == 'dataManagement',
      ) as unknown as IDataManagementView;
      dataManagement?.showDetail(mapId, value);
    },
  });
}

export function createMenuItemShowDetailInfoSource() {
  return createMenuItem({
    type: 'item',
    name: 'Info',
    icon: mdiInformation,
    click: [
      [
        'addComponent',
        (layer, mapId) => {
          const source = findSiblingOrNearestLeaf(
            layer,
            (dataset) => dataset.type == 'source',
          ) as IMapboxSourceView | null;
          if (source)
            return [
              layer,
              mapId,
              {
                componentKey: 'layer-detail',
                attr: {
                  item: source.getDataInfo(),
                  fields: source.getFieldsInfo(),
                  view: layer,
                },
                check: 'detail',
              },
            ];
        },
      ],
    ],
  });
}
export function createMenuItemStyleEdit() {
  return createMenuItem({
    type: 'item',
    name: 'Edit style',
    icon: mdiFormatLineStyle,
    click: [
      [
        'addComponent',
        (layer, mapId) => [
          layer,
          mapId,
          {
            componentKey: 'style-control',
            attr: {
              item: layer,
            },
          },
        ],
      ],
    ],
  });
}

export function createMenuItemToggleShow(
  menu: Partial<MenuItemBottomOrExtra<any>> = {},
) {
  return createMenuItem({
    type: 'item',
    location: 'extra',
    name: 'ToggleShow',
    componentKey: 'layer-action-toggle-show',
    ...menu,
  });
}

export function createMenuItemSetOpacity(
  menu: Partial<MenuItemBottomOrExtra<any>> = {},
) {
  return createMenuItem({
    type: 'item',
    location: 'prebottom',
    name: 'SetOpacity',
    componentKey: 'layer-action-set-opacity',
    ...menu,
  });
}
