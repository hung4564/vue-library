import { fitBounds } from '@hungpvq/shared-map';
import { getMap } from '@hungpvq/vue-map-core';
import { mdiCrosshairsGps, mdiFormatLineStyle, mdiInformation } from '@mdi/js';
import type {
  IActionForView,
  IDataManagementView,
  IDataset,
  IMapboxSourceView,
  IMetadataView,
  MenuAction,
  MenuItemBottomOrExtra,
  MenuItemCustomComponentBottomOrExtra,
} from '../interfaces';
import LayerDetail from '../modules/LayerDetail/LayerDetail.vue';
import StyleControl from '../modules/StyleControl/style-control.vue';
import { useMapDatasetComponent, useMapDatasetHighlight } from '../store';
import { findSiblingOrNearestLeaf } from './dataset.visitors';
import ToggleShow from './menu/toggle-show.vue';

export function createDatasetMenu<
  T extends IDataset = IDataset,
>(): IActionForView<T> {
  const menus: MenuAction<T>[] = [];
  return {
    getMenus() {
      return menus;
    },
    addMenu(menu: MenuAction<T>) {
      if (menu.id && menus.some((m) => m.id === menu.id)) {
        return; // Không thêm nếu trùng id
      }
      menus.push(menu);
    },
    addMenus(menusToAdd: MenuAction<T>[]) {
      for (const menu of menusToAdd) {
        // Nếu có hàm kiểm tra → phải pass check

        // Kiểm tra không trùng ID
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
    click: (layer, mapId, value) => {
      const { setFeatureHighlight } = useMapDatasetHighlight(mapId);
      getMap(mapId, (map) => {
        fitBounds(map, value.geometry);
        const { geometry, ...properties } = value;
        setFeatureHighlight(
          {
            type: 'Feature',
            geometry,
            properties,
          },
          'identify',
          layer,
        );
      });
    },
  });
}
export function createMenuItemShowDetailForItem() {
  return createMenuItem({
    type: 'item',
    name: 'Detail',
    id: 'show-detail',
    icon: mdiInformation,
    click: (layer, mapId, value) => {
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
    click: (layer, mapId) => {
      const source = findSiblingOrNearestLeaf(
        layer,
        (dataset) => dataset.type == 'source',
      ) as IMapboxSourceView | null;
      if (source) {
        const { addComponent } = useMapDatasetComponent(mapId);
        addComponent({
          component: () => LayerDetail,
          attr: {
            item: source.getDataInfo(),
            fields: source.getFieldsInfo(),
            view: layer,
          },
          check: 'detail',
        });
      }
    },
  });
}
export function createMenuItemStyleEdit() {
  return createMenuItem({
    type: 'item',
    name: 'Edit style',
    icon: mdiFormatLineStyle,
    click: (layer, mapId) => {
      const { addComponent } = useMapDatasetComponent(mapId);
      addComponent({
        component: () => StyleControl,
        attr: {
          item: layer,
        },
      });
    },
  });
}

export function createMenuItemToggleShow(
  menu: Partial<MenuItemBottomOrExtra<any>> = {},
) {
  return createMenuItem({
    type: 'item',
    location: 'bottom',
    name: 'ToggleShow',
    component: () => ToggleShow,
    ...menu,
  });
}
