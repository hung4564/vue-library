import type { WithMapPropType } from '@hungpvq/map-core';
import { fitBounds } from '@hungpvq/map-core';
import type { MenuClickAddComponent, MenuClickFitBounds, MenuClickHighlight, MenuItemProps } from '@hungpvq/map-dataset/menu';
import { addListViewsToGroup, addListViewsToNewGroup, canMoveListView, type IListViewUI, moveListView, syncListViewLayerOrder } from '@hungpvq/map-dataset';
import { LIST_VIEW_MENU_ID } from '@hungpvq/map-dataset/menu';
import {
  defaultMapProps,
  UniversalRegistry,
  useMap,
} from '@hungpvq/react-map-core';
import { useLayoutEffect, useRef } from 'react';
import { useMapDataset } from '../store/dataset-api';
import { notifyMapDatasetStore } from '../store/dataset-store';
import { useMapDatasetComponent } from '../store/component';
import { useMapHighlight } from '../store/highlight';

export function LayerMenuDefaultHandle(props: WithMapPropType) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, callMap } = useMap(merged);
  const { addComponent } = useMapDatasetComponent(mapId);
  const hl = useMapHighlight(mapId);
  const { getAllComponentsByType, getStoreDataset } = useMapDataset(mapId);

  const addComponentRef = useRef(addComponent);
  const callMapRef = useRef(callMap);
  const hlRef = useRef(hl);
  const getAllComponentsByTypeRef = useRef(getAllComponentsByType);
  const getStoreDatasetRef = useRef(getStoreDataset);
  addComponentRef.current = addComponent;
  callMapRef.current = callMap;
  hlRef.current = hl;
  getAllComponentsByTypeRef.current = getAllComponentsByType;
  getStoreDatasetRef.current = getStoreDataset;

  useLayoutEffect(() => {
    function refreshList() {
      const store = getStoreDatasetRef.current();
      if (store) notifyMapDatasetStore(store);
    }

    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      LIST_VIEW_MENU_ID.addComponent,
      ({ value }: MenuItemProps<MenuClickAddComponent>) => {
        if (value) addComponentRef.current(value);
      },
    );
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      LIST_VIEW_MENU_ID.fitBounds,
      ({ value }: MenuItemProps<MenuClickFitBounds | unknown>) => {
        callMapRef.current((map) => {
          const target =
            value &&
            typeof value === 'object' &&
            'detail' in value &&
            (value as MenuClickFitBounds).detail != null
              ? (value as MenuClickFitBounds).detail
              : value;
          if (target) fitBounds(map, target as never);
        });
      },
    );
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      LIST_VIEW_MENU_ID.highlight,
      ({ value, layer }: MenuItemProps<MenuClickHighlight>) => {
        if (value) {
          return hlRef.current.show(value.detail, {
            source: value.key,
            dataset: layer,
          });
        }
      },
    );
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      LIST_VIEW_MENU_ID.layer.addToGroup,
      ({ layer }: MenuItemProps) => {
        const next = addListViewsToNewGroup(
          getAllComponentsByTypeRef.current<IListViewUI>('list'),
          [layer.id],
        );
        callMapRef.current((map) => syncListViewLayerOrder(map, next));
        refreshList();
      },
    );
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      LIST_VIEW_MENU_ID.layer.addToExistingGroup,
      ({ layer, meta }: MenuItemProps) => {
        const groupId =
          typeof meta?.groupId === 'string' ? meta.groupId : undefined;
        const groupName =
          typeof meta?.groupName === 'string' && meta.groupName
            ? meta.groupName
            : 'New Group';
        if (!groupId) return;
        const next = addListViewsToGroup(
          getAllComponentsByTypeRef.current<IListViewUI>('list'),
          [layer.id],
          { id: groupId, name: groupName },
        );
        callMapRef.current((map) => syncListViewLayerOrder(map, next));
        refreshList();
      },
    );
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      LIST_VIEW_MENU_ID.layer.moveUp,
      ({ layer }: MenuItemProps) => {
        const views = getAllComponentsByTypeRef.current<IListViewUI>('list');
        if (!canMoveListView(views, layer.id, 'up')) return;
        const next = moveListView(views, layer.id, 'up');
        callMapRef.current((map) => syncListViewLayerOrder(map, next));
        refreshList();
      },
    );
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      LIST_VIEW_MENU_ID.layer.moveDown,
      ({ layer }: MenuItemProps) => {
        const views = getAllComponentsByTypeRef.current<IListViewUI>('list');
        if (!canMoveListView(views, layer.id, 'down')) return;
        const next = moveListView(views, layer.id, 'down');
        callMapRef.current((map) => syncListViewLayerOrder(map, next));
        refreshList();
      },
    );

    return () => {
      for (const key of [
        LIST_VIEW_MENU_ID.addComponent,
        LIST_VIEW_MENU_ID.fitBounds,
        LIST_VIEW_MENU_ID.highlight,
        LIST_VIEW_MENU_ID.layer.addToGroup,
        LIST_VIEW_MENU_ID.layer.addToExistingGroup,
        LIST_VIEW_MENU_ID.layer.moveUp,
        LIST_VIEW_MENU_ID.layer.moveDown,
      ] as const) {
        UniversalRegistry.unregisterMenuHandlerForMap(mapId, key);
      }
    };
  }, [mapId]);

  return null;
}
