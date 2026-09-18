import type { MapSimple } from '@hungpvq/map-core';
import type { IListViewUI, LayerListGroupTree, LayerListItem } from '@hungpvq/map-dataset';
import { LAYER_CONTROL_LOCALE, layerMatchesSearch, listListViewGroups, syncListViewLayerOrder } from '@hungpvq/map-dataset';
import { MapControlButton, useLang, useMap } from '@hungpvq/react-map-core';
import { InputText } from '@hungpvq/react-map-core/fields';
import { mdiClose, mdiDelete, mdiGroup, mdiLayers, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import { type KeyboardEvent as ReactKeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { MenuConditionProvider } from '../../extra/menu/condition-context';
import { useMapDataset } from '../../store/dataset-api';
import { ButtonToggleShowAll } from './ButtonToggleShowAll';
import {
  DraggableGroupList,
  type DraggableGroupListRef,
} from './DraggableList/DraggableGroupList';
import { LayerItem } from './layer-item';
import { MENU_CONTROL_ID } from '@hungpvq/map-dataset/menu';
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
  const { trans, registerLocale } = useLang(mapId);
  const { getAllComponentsByType, removeComponent, datasetVersion } =
    useMapDataset(mapId);
  const [views, setViews] = useState<LayerListItem[]>([]);
  const [layerSearch, setLayerSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(layerSearch), 150);
    return () => clearTimeout(timer);
  }, [layerSearch]);
  const filteredViews = useMemo(() => {
    if (!debouncedSearch.trim()) return views;
    return views.filter((view) => layerMatchesSearch(view, debouncedSearch));
  }, [views, debouncedSearch]);
  const listDisabledDrag =
    Boolean(disabledDrag) || Boolean(debouncedSearch.trim());
  const groupRef = useRef<DraggableGroupListRef>(null);
  useEffect(() => {
    registerLocale('en', LAYER_CONTROL_LOCALE);
  }, [registerLocale]);
  function refresh() {
    const viewSource = getAllComponentsByType<IListViewUI>('list');
    const next = (viewSource.sort((a, b) => b.index - a.index) ||
      []) as LayerListItem[];
    setViews(next);
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetVersion, mapId]);
  function updateLayers(items: LayerListItem[]) {
    callMap((map: MapSimple) => {
      syncListViewLayerOrder(map, items.slice());
    });
  }
  function onItemsChange(next: LayerListItem[]) {
    if (debouncedSearch.trim()) return;
    setViews(next);
    updateLayers(next);
  }
  function onRemoveGroupLayer(group: LayerListGroupTree) {
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
  function getMenuGroups() {
    const treeGroups = groupRef.current?.getGroups() ?? [];
    return treeGroups.length > 0 ? treeGroups : listListViewGroups(views);
  }
  const isEmpty = views.length === 0;
  const showCreate = Boolean(onCreate) && !disabledCreate && !readonly;
  function isInteractiveTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    return (
      tag === 'BUTTON' ||
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      tag === 'A' ||
      target.isContentEditable
    );
  }
  function onTreeKeydown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (isInteractiveTarget(event.target)) return;
    const tree = event.currentTarget;
    const items = Array.from(
      tree.querySelectorAll<HTMLElement>('[role="treeitem"]'),
    );
    if (!items.length) return;
    const active = document.activeElement;
    const currentIndex = items.findIndex(
      (el) => el === active || el.contains(active),
    );
    const current = currentIndex >= 0 ? items[currentIndex] : null;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex =
        currentIndex < 0
          ? event.key === 'ArrowDown'
            ? 0
            : items.length - 1
          : Math.max(0, Math.min(items.length - 1, currentIndex + delta));
      items[nextIndex]?.focus();
      return;
    }

    if (!current) return;
    const expanded = current.getAttribute('aria-expanded');
    if (expanded == null) return;

    if (
      event.key === 'ArrowRight' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      if (expanded === 'false') {
        event.preventDefault();
        current
          .querySelector<HTMLButtonElement>('[data-map-layer-group-toggle]')
          ?.click();
      }
    } else if (event.key === 'ArrowLeft' && expanded === 'true') {
      event.preventDefault();
      current
        .querySelector<HTMLButtonElement>('[data-map-layer-group-toggle]')
        ?.click();
    }
  }
  return (
    <MenuConditionProvider
      value={{
        control: MENU_CONTROL_ID.layerControl,
        readonly: !!readonly,
        disabledMove: !!disabledMove,
        disabledCreateGroup: !!disabledCreateGroup,
      }}
    >
      <div className="layer-control-container">
        <div className="layer-control__search">
          <InputText
            value={layerSearch}
            onChange={setLayerSearch}
            placeholder={trans('map.layer-control.search')}
            aria-label="Search layers"
            data-map-layer-search
            data-map-id={mapId}
          />
          {layerSearch.trim() ? (
            <MapControlButton variant="plain"
              className="layer-control__search-clear"
              title="Clear search"
              onClick={() => setLayerSearch('')}
            >
              <Icon path={mdiClose} size="14px" />
            </MapControlButton>
          ) : null}
        </div>
        {!isEmpty && (
          <div className="layer-control__header">
            {title}
            <div className="v-spacer" />
            <ButtonToggleShowAll mapId={mapId} items={views} />
            {!disabledCreateGroup && (
              <MapControlButton onClick={addNewGroup} title="Create group" variant="plain">
                <Icon path={mdiGroup} size={HEADER_ICON} />
              </MapControlButton>
            )}
            {!disabledDeleteAll && (
              <MapControlButton
                onClick={onRemoveAllLayer}
                title="Delete all layers" variant="plain">
                <Icon path={mdiDelete} size={HEADER_ICON} />
              </MapControlButton>
            )}
          </div>
        )}
        <div
          className="layer-control__list"
          role="tree"
          aria-label={trans('map.layer-control.title')}
          onKeyDown={onTreeKeydown}
        >
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
          {!isEmpty &&
            Boolean(debouncedSearch.trim()) &&
            filteredViews.length === 0 && (
              <div className="layer-control__empty layer-control__empty--search">
                <div className="layer-control__empty-title">
                  {trans('map.layer-control.search-empty')}
                </div>
              </div>
            )}
          <div
            style={
              isEmpty ||
              (Boolean(debouncedSearch.trim()) && filteredViews.length === 0)
                ? { display: 'none' }
                : undefined
            }
          >
            <DraggableGroupList
              ref={groupRef}
              items={filteredViews}
              selected={selected}
              disabledDrag={listDisabledDrag}
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
                  searchQuery={debouncedSearch}
                  getGroups={getMenuGroups}
                  onTitleClick={toggleSelect}
                  onRemove={(layer) => {
                    removeComponent(layer);
                    refresh();
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
    </MenuConditionProvider>
  );
}

