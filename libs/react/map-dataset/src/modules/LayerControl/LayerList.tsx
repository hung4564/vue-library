import type { MapSimple } from '@hungpvq/map-core';
import type { IListViewUI, MenuAction } from '@hungpvq/map-dataset';
import {
  LAYER_CONTROL_LOCALE,
  handleMenuAction,
  hasMoveLayer,
  listListViewGroups,
  traverseTree,
} from '@hungpvq/map-dataset';
import { ContextMenu, type ContextMenuRef } from '@hungpvq/react-draggable';
import { BaseButton, useLang, useMap } from '@hungpvq/react-map-core';
import { mdiDelete, mdiGroup, mdiLayers, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useMapDataset } from '../../store';
import { MenuConditionProvider } from '../../extra/menu/condition-context';
import { ButtonToggleShowAll } from './ButtonToggleShowAll';
import {
  DraggableGroupList,
  type DraggableGroupListRef,
} from './DraggableList/DraggableGroupList';
import type { GroupTree, LayerListItem } from './DraggableList/utils';
import { LayerItem } from './layer-item';
import { LayerContextMenuList } from './layer-context-menu-list';

const HEADER_ICON = '16px';

export function LayerList({
  mapId,
  readonly,
  title,
  disabledCreate,
  disabledCreateGroup,
  disabledDeleteAll,
  disabledDrag,
  disabledMove,
  onCreate,
}: {
  mapId: string;
  readonly?: boolean;
  title?: ReactNode;
  disabledCreate?: boolean;
  disabledCreateGroup?: boolean;
  disabledDeleteAll?: boolean;
  disabledDrag?: boolean;
  disabledMove?: boolean;
  onCreate?: () => void;
}) {
  const { callMap } = useMap({ mapId });
  const { trans, setLocaleDefault } = useLang(mapId);
  const { getAllComponentsByType, removeComponent, datasetVersion } =
    useMapDataset(mapId);
  const [views, setViews] = useState<LayerListItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const groupRef = useRef<DraggableGroupListRef>(null);
  const contextMenuRef = useRef<ContextMenuRef>(null);
  const [menuContext, setMenuContext] = useState<{
    items: MenuAction<IListViewUI>[];
    view?: IListViewUI;
  }>({ items: [] });

  useEffect(() => {
    setLocaleDefault(LAYER_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  function refresh() {
    const viewSource = getAllComponentsByType<IListViewUI>('list');
    const next = (viewSource.sort((a, b) => b.index - a.index) ||
      []) as LayerListItem[];
    setViews(next);
    groupRef.current?.update(next);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetVersion, mapId]);

  function updateLayers(items: LayerListItem[]) {
    callMap((map: MapSimple) => {
      let beforeId = '';
      items.slice().forEach((view, index, arr) => {
        view.index = arr.length - index;
        const parent = view.getParent();
        traverseTree(
          parent || view,
          (node) => {
            if (hasMoveLayer(node)) {
              node.moveLayer(map, beforeId);
              beforeId = node.getBeforeId() || '';
            }
          },
          { direction: 'rtl' },
        );
      });
    });
  }

  function onItemsChange(next: LayerListItem[]) {
    setViews(next);
    updateLayers(next);
  }

  function onRemoveGroupLayer(group: GroupTree) {
    if (!group?.children?.length) return;
    group.children.forEach((view) => removeComponent(view));
  }

  function onRemoveAllLayer() {
    if (!views.length) return;
    views.forEach((view) => removeComponent(view));
    refresh();
  }

  function addNewGroup() {
    groupRef.current?.addNewGroup('');
  }

  function onLayerAction({
    event,
    action,
    item,
  }: {
    event: React.MouseEvent | MouseEvent;
    action: MenuAction<IListViewUI>;
    item: IListViewUI;
  }) {
    const native =
      'nativeEvent' in event ? event.nativeEvent : (event as MouseEvent);
    handleMenuAction(action, {
      event: native,
      layer: item,
      mapId,
      value: item,
    });
  }

  function handleContextClick({
    event,
    item,
    actions,
  }: {
    event: React.MouseEvent;
    item: IListViewUI;
    actions: MenuAction<IListViewUI>[];
  }) {
    setMenuContext({
      items: actions ? [...actions] : [],
      view: item,
    });
    contextMenuRef.current?.open(event);
  }

  function getMenuGroups() {
    const treeGroups = groupRef.current?.getGroups() ?? [];
    return treeGroups.length > 0 ? treeGroups : listListViewGroups(views);
  }

  function closeContextMenu() {
    setMenuContext({ items: [], view: undefined });
    contextMenuRef.current?.close();
  }

  const isEmpty = views.length === 0;
  const showCreate = Boolean(onCreate) && !disabledCreate && !readonly;

  return (
    <MenuConditionProvider
      value={{
        readonly: !!readonly,
        disabledMove: !!disabledMove,
        disabledCreateGroup: !!disabledCreateGroup,
      }}
    >
      <div className="layer-control-container">
      <div className="layer-control__header">
        {title}
        <div className="v-spacer" />
        {!isEmpty && (
          <>
            <ButtonToggleShowAll mapId={mapId} items={views} />
            {!disabledCreateGroup && (
              <BaseButton onClick={addNewGroup} aria-label="Create group">
                <Icon path={mdiGroup} size={HEADER_ICON} />
              </BaseButton>
            )}
            {!disabledDeleteAll && (
              <BaseButton onClick={onRemoveAllLayer} aria-label="Delete all layers">
                <Icon path={mdiDelete} size={HEADER_ICON} />
              </BaseButton>
            )}
          </>
        )}
      </div>
      <div className="layer-control__list">
        {isEmpty && (
          <div className="layer-control__empty">
            <Icon
              className="layer-control__empty-icon"
              path={mdiLayers}
              size="36px"
            />
            <div className="layer-control__empty-title">
              {trans('map.layer-control.empty')}
            </div>
            {showCreate && (
              <div className="layer-control__empty-hint">
                {trans('map.layer-control.empty-hint')}
              </div>
            )}
            {showCreate && (
              <button
                type="button"
                className="layer-control__empty-action"
                onClick={onCreate}
              >
                <Icon path={mdiPlus} size="14px" />
                {trans('map.layer-control.create-btn')}
              </button>
            )}
          </div>
        )}
        <div hidden={isEmpty}>
          <DraggableGroupList
            ref={groupRef}
            items={views}
            selected={selected}
            disabledDrag={disabledDrag}
            onSelectedChange={setSelected}
            onItemsChange={onItemsChange}
            onGroupRemove={onRemoveGroupLayer}
            renderItem={({ item, toggleSelect }) => (
              <LayerItem
                item={item}
                mapId={mapId}
                readonly={readonly}
                disabledMove={disabledMove}
                disabledCreateGroup={disabledCreateGroup}
                onTitleClick={toggleSelect}
                onRemove={(layer) => {
                  removeComponent(layer);
                  refresh();
                }}
                onAction={onLayerAction}
                onContextMenu={handleContextClick}
              />
            )}
          />
        </div>
      </div>
      <ContextMenu ref={contextMenuRef}>
        <LayerContextMenuList
          items={menuContext.items}
          view={menuContext.view}
          mapId={mapId}
          getGroups={getMenuGroups}
          onClose={closeContextMenu}
          onSelect={({ action, event }) => {
            if (menuContext.view) {
              onLayerAction({
                action,
                item: menuContext.view,
                event,
              });
            }
            closeContextMenu();
          }}
        />
      </ContextMenu>
    </div>
    </MenuConditionProvider>
  );
}
