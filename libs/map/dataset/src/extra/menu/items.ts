import { fitBounds } from '@hungpvq/shared-map';
import { getMap } from '@hungpvq/vue-map-core';
import { mdiCrosshairsGps, mdiFormatLineStyle, mdiInformation } from '@mdi/js';
import type { BBox } from 'geojson';
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
import { createMenuBuilder, createMenuClickBuilder } from './builder';
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

export function createMenuItemToBoundActionForList(props?: { bbox?: BBox }) {
  return createMenuBuilder()
    .item()
    .setLocation('extra')
    .setName('Fly to')
    .setIcon(mdiCrosshairsGps)
    .setClick((layer, mapId) => {
      if (props?.bbox) {
        getMap(mapId, (map) => {
          fitBounds(map, props?.bbox);
        });
        return;
      }
      const metadata = findSiblingOrNearestLeaf(
        layer,
        (dataset) => dataset.type === 'metadata',
      ) as IMetadataView;

      getMap(mapId, (map) => {
        fitBounds(map, metadata?.metadata?.bbox);
      });
    })
    .build();
}

export function createMenuItemToBoundActionForItem() {
  return createMenuBuilder() //  = kiểu layer, bạn thay đúng type nếu có
    .item()
    .setLocation('menu')
    .setName('Fly to')
    .setIcon(mdiCrosshairsGps)
    .setClick(
      createMenuClickBuilder()
        .addTupleDynamic('fitBounds', (layer, mapId, value) => [
          layer,
          mapId,
          value.geometry,
        ])
        .addTupleDynamic('highlight', (layer, mapId, value) => {
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
        }),
    )
    .build();
}
export function createMenuItemShowDetailForItem(fields: FieldFeaturesDef = []) {
  return createMenuBuilder()
    .item()
    .setLocation('menu')
    .setName('Detail')
    .setId('show-detail')
    .setIcon(mdiInformation)
    .setClick((layer, mapId, value) => {
      if (fields && fields.length > 0) {
        const click = createMenuClickBuilder()
          .addTupleStatic('addComponent', [
            layer,
            mapId,
            {
              componentKey: 'layer-detail',
              attr: {
                item: value,
                fields,
                view: layer,
              },
              check: 'detail',
            },
          ])
          .addTupleStatic('highlight', [
            layer,
            mapId,
            {
              detail: convertItemToFeature(value),
              key: 'detail',
            },
          ])
          .build();
        handleMenuActionClick(click, layer, mapId, value);
        return;
      }

      const dataManagement = findSiblingOrNearestLeaf(
        layer,
        (dataset) => dataset.type == 'dataManagement',
      ) as unknown as IDataManagementView;
      dataManagement?.showDetail(mapId, value);
    })
    .build();
}

export function createMenuItemShowDetailInfoSource() {
  return createMenuBuilder()
    .item()
    .setName('Info')
    .setIcon(mdiInformation)
    .setClick(
      createMenuClickBuilder()
        .addTupleDynamic('addComponent', (layer, mapId) => {
          const source = findSiblingOrNearestLeaf(
            layer,
            (dataset) => dataset.type === 'source',
          ) as IMapboxSourceView | null;
          if (source) {
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
          }
        })
        .build(),
    )
    .build();
}
export function createMenuItemStyleEdit() {
  return createMenuBuilder()
    .item()
    .setName('Edit style')
    .setIcon(mdiFormatLineStyle)
    .setClick(
      createMenuClickBuilder()
        .addTupleDynamic('addComponent', (layer, mapId) => [
          layer,
          mapId,
          {
            componentKey: 'style-control',
            attr: {
              item: layer,
            },
          },
        ])
        .build(),
    )
    .build();
}

export function createMenuItemToggleShow(
  menu: Partial<MenuItemBottomOrExtra<IDataset>> = {},
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
  menu: Partial<MenuItemBottomOrExtra<IDataset>> = {},
) {
  return createMenuBuilder()
    .item()
    .setLocation('prebottom')
    .setName('SetOpacity')
    .setComponentKey('layer-action-set-opacity')
    .setAdditional(menu)
    .build();
}
