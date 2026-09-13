import type { IListViewUI } from '@hungpvq/map-dataset';
import type {
  ListViewGroupOption,
  MenuAction,
  MenuContextSource,
} from '@hungpvq/map-dataset/menu';
import {
  createMenuConditionContext,
  getResolvedMenus,
  partitionMenuActions,
} from '@hungpvq/map-dataset/menu';
import { findAllComponentsByType, splitSearchHighlight } from '@hungpvq/map-dataset';
import { MapControlButton, RegistryItem, useShow } from '@hungpvq/react-map-core';

import { mdiDelete, mdiMenuDown, mdiMenuLeft } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useMemo, useState } from 'react';
import { useMenuConditionContext } from '../../extra/menu/condition-context';
import { DatasetMenus } from '../../extra/menu/dataset-menus';
import { LayerSubItem } from './layer-sub-item';

const ICON_SIZE = '14px';

export function LayerItem({
  item,
  mapId,
  readonly,
  disabledMove,
  disabledCreateGroup,
  searchQuery,
  getGroups,
  menuContext,
  onRemove,
  onTitleClick,
}: {
  item: IListViewUI;
  mapId: string;
  readonly?: boolean;
  disabledMove?: boolean;
  disabledCreateGroup?: boolean;
  searchQuery?: string;
  getGroups?: () => ListViewGroupOption[];
  menuContext?: MenuContextSource;
  onRemove?: (item: IListViewUI) => void;
  onTitleClick?: () => void;
}) {
  const [legendShow, toggleLegend] = useShow(item.config?.init_show_legend ?? false);
  const [childrenShow, toggleChildren] = useShow(
    item.config?.init_show_children ?? false,
  );
  const [children, setChildren] = useState<IListViewUI[]>([]);

  useEffect(() => {
    const childItems =
      (findAllComponentsByType(item, 'list-item') as IListViewUI[]).sort(
        (a, b) => b.index - a.index,
      ) || [];
    setChildren(childItems);
  }, [item, item.id]);

  const injectedMenuContext = useMenuConditionContext();
  const rowMenuContexts = useMemo(
    () =>
      [
        {
          readonly,
          disabledMove,
          disabledCreateGroup,
        },
        menuContext,
      ] as MenuContextSource[],
    [readonly, disabledMove, disabledCreateGroup, menuContext],
  );
  const conditionCtx = createMenuConditionContext(item, {
    mapId,
    context: [injectedMenuContext, ...rowMenuContexts],
  });

  const menus = useMemo(
    () => getResolvedMenus(item, 'layer') as MenuAction<IListViewUI>[],
    [item],
  );
  const partitioned = useMemo(
    () => partitionMenuActions(menus, conditionCtx),
    [menus, conditionCtx],
  );
  const showBottom =
    !readonly &&
    (!item.config?.disabled_opacity || partitioned.bottom.length > 0);
  const nameParts = useMemo(
    () => splitSearchHighlight(item.getName?.() ?? '', searchQuery ?? ''),
    [item, searchQuery],
  );

  return (
    <div className="layer-item-container">
      <div className="layer-item__info">
        {item.icon?.componentKey && (
          <div className="layer-item__icon">
            <RegistryItem
              componentKey={item.icon.componentKey}
              mapId={mapId}
              {...item.icon.attr}
              data={item}
            />
          </div>
        )}
        <span
          className="layer-item__title"
          title={item.getName()}
          onClick={() => onTitleClick?.()}
        >
          {nameParts.map((part, i) =>
            part.match ? (
              <mark key={i} className="layer-item__search-match">
                {part.text}
              </mark>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
        </span>
        <div className="v-spacer" />
        <div className="layer-item__title-action">
          <DatasetMenus
            menus={menus}
            data={item}
            mapId={mapId}
            locations={['extra', 'menu']}
            getGroups={getGroups}
            menuContext={rowMenuContexts}
          />
          {!readonly && !item.config?.disabled_delete && (
            <MapControlButton
              variant="plain"
              size="small"
              onClick={() => onRemove?.(item)}
            >
              <Icon path={mdiDelete} size={ICON_SIZE} />
            </MapControlButton>
          )}
          {!showBottom && (
            <>
              <DatasetMenus
                menus={menus}
                data={item}
                mapId={mapId}
                locations={['bottom']}
                getGroups={getGroups}
                menuContext={rowMenuContexts}
              />
              {item.legend && (
                <MapControlButton
                  variant="plain"
                  size="small"
                  onClick={() => toggleLegend()}
                >
                  <Icon
                    path={legendShow ? mdiMenuDown : mdiMenuLeft}
                    size={ICON_SIZE}
                  />
                </MapControlButton>
              )}
            </>
          )}
        </div>
      </div>
      {showBottom && (
        <div className="layer-item__action">
          <DatasetMenus
            menus={menus}
            data={item}
            mapId={mapId}
            locations={['prebottom']}
            getGroups={getGroups}
            menuContext={rowMenuContexts}
          />
          <div className="v-spacer" />
          <DatasetMenus
            menus={menus}
            data={item}
            mapId={mapId}
            locations={['bottom']}
            getGroups={getGroups}
            menuContext={rowMenuContexts}
          />
          {children.length > 0 && (
            <MapControlButton
              variant="plain"
              size="small"
              onClick={() => toggleChildren()}
            >
              <Icon
                path={childrenShow ? mdiMenuDown : mdiMenuLeft}
                size={ICON_SIZE}
              />
            </MapControlButton>
          )}
          {item.legend && (
            <MapControlButton
              variant="plain"
              size="small"
              onClick={() => toggleLegend()}
            >
              <Icon
                path={legendShow ? mdiMenuDown : mdiMenuLeft}
                size={ICON_SIZE}
              />
            </MapControlButton>
          )}
        </div>
      )}
      {legendShow && item.legend && (
        <div>
          <RegistryItem
            componentKey={item.legend.componentKey}
            mapId={mapId}
            data={item}
            {...item.legend.attr}
          />
        </div>
      )}
      {childrenShow && children.length > 0 && (
        <div className="layer-item__children">
          {children.map((child) => (
            <LayerSubItem
              key={child.id}
              item={child}
              mapId={mapId}
              readonly={readonly}
              disabledMove={disabledMove}
              disabledCreateGroup={disabledCreateGroup}
              getGroups={getGroups}
              menuContext={menuContext}
            />
          ))}
        </div>
      )}
    </div>
  );
}
