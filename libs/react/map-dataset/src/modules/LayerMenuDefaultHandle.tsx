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
import {
  notifyMapDatasetStore,
  useMapDataset,
  useMapDatasetComponent,
  useMapDatasetHighlight,
} from '../store';

export function LayerMenuDefaultHandle(props: WithMapPropType) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, callMap } = useMap(merged);
  const { addComponent } = useMapDatasetComponent(mapId);
  const { setFeatureHighlight } = useMapDatasetHighlight(mapId);
  const { getAllComponentsByType, getStoreDataset } = useMapDataset(mapId);

  const addComponentRef = useRef(addComponent);
  const callMapRef = useRef(callMap);
  const setFeatureHighlightRef = useRef(setFeatureHighlight);
  const getAllComponentsByTypeRef = useRef(getAllComponentsByType);
  const getStoreDatasetRef = useRef(getStoreDataset);
  addComponentRef.current = addComponent;
  callMapRef.current = callMap;
  setFeatureHighlightRef.current = setFeatureHighlight;
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
        if (value)
          setFeatureHighlightRef.current(value.detail, value.key, layer);
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
  }, [mapId]);

  return null;
}
