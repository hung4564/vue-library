import { fitBounds } from '@hungpvq/shared-map';
import { getMap } from '@hungpvq/vue-map-core';
import { mdiCrosshairsGps, mdiFormatLineStyle, mdiInformation } from '@mdi/js';
import {
  IActionForView,
  IDataset,
  IMapboxSourceView,
  IMetadataView,
  MenuAction,
  MenuItemBottomOrExtra,
} from '../interfaces';
import LayerDetail from '../modules/LayerDetail/LayerDetail.vue';
import StyleControl from '../modules/StyleControl/style-control.vue';
import { addComponent, setFeatureHighlight } from '../store';
import { findSiblingOrNearestLeaf } from './dataset.visitors';
import { DataManagementMapboxComponent } from './part-data-management,model';

export function createDatasetMenu<
  T extends IDataset = IDataset
>(): IActionForView<T> {
  const menus: MenuAction<T>[] = [];
  return {
    menus,
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
  item: MenuItemBottomOrExtra<T>
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
        (dataset) => dataset.type == 'metadata'
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
      getMap(mapId, (map) => {
        fitBounds(map, value.geometry);
        const { geometry, ...properties } = value;
        setFeatureHighlight(
          mapId,
          {
            type: 'Feature',
            geometry,
            properties,
          },
          'identify'
        );
      });
    },
  });
}
export function createMenuItemShowDetailForItem() {
  return createMenuItem({
    type: 'item',
    name: 'Detail',
    icon: mdiInformation,
    click: (layer, mapId, value) => {
      const dataManagement = findSiblingOrNearestLeaf(
        layer,
        (dataset) => dataset.type == 'dataManagement'
      ) as DataManagementMapboxComponent;
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
        (dataset) => dataset.type == 'source'
      ) as IMapboxSourceView | null;
      if (source)
        addComponent(mapId, {
          component: () => LayerDetail,
          attr: {
            item: source.getDataInfo(),
            fields: source.getFieldsInfo(),
            view: layer,
          },
        });
    },
  });
}
export function createMenuItemStyleEdit() {
  return createMenuItem({
    type: 'item',
    name: 'Edit style',
    icon: mdiFormatLineStyle,
    click: (layer, mapId) => {
      addComponent(mapId, {
        component: () => StyleControl,
        attr: {
          item: layer,
        },
      });
    },
  });
}
