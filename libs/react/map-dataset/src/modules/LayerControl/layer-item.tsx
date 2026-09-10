import type { IListViewUI } from '@hungpvq/map-dataset';
import type { MenuAction } from '@hungpvq/map-dataset/menu';
import { createMenuConditionContext, getResolvedMenus, isMenuItemDisabled, isMenuItemHidden } from '@hungpvq/map-dataset/menu';
import { findAllComponentsByType, splitSearchHighlight } from '@hungpvq/map-dataset';
import { MapControlButton, RegistryItem, useShow } from '@hungpvq/react-map-core';

import { mdiDelete, mdiDotsVertical, mdiMenuDown, mdiMenuLeft } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useMemo, useState } from 'react';
import { useMenuConditionContext } from '../../extra/menu/condition-context';
import { DatasetMenuButton } from '../../extra/menu/dataset-menu-button';
import { LayerSubItem } from './layer-sub-item';

const ICON_SIZE = '14px';

export function LayerItem({
  item,
  mapId,
  readonly,
  disabledMove,
  disabledCreateGroup,
  searchQuery,
  onRemove,
  onAction,
  onContextMenu,
  onTitleClick,
}: {
  item: IListViewUI;
  mapId: string;
  readonly?: boolean;
  disabledMove?: boolean;
  disabledCreateGroup?: boolean;
  searchQuery?: string;
  onRemove?: (item: IListViewUI) => void;
  onAction?: (payload: {
    event: React.MouseEvent;
    action: MenuAction<IListViewUI>;
    item: IListViewUI;
  }) => void;
  onContextMenu?: (payload: {
    event: React.MouseEvent;
    actions: MenuAction<IListViewUI>[];
    item: IListViewUI;
  }) => void;
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
  const conditionCtx = createMenuConditionContext(item, {
    mapId,
    context: [
      {
        readonly,
        disabledMove,
        disabledCreateGroup,
      },
      injectedMenuContext,
    ],
  });

  const menus = useMemo(
    () => getResolvedMenus(item, 'layer') as MenuAction<IListViewUI>[],
    [item],
  );
  const extraMenus = menus
    .filter((x) => !x.location || x.location === 'extra')
    .filter((x) => !isMenuItemHidden(x, conditionCtx))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const preBottomMenus = menus
    .filter((x) => x.location === 'prebottom')
    .filter((x) => !isMenuItemHidden(x, conditionCtx))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const bottomMenus = menus
    .filter((x) => x.location === 'bottom')
    .filter((x) => !isMenuItemHidden(x, conditionCtx))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const contentMenus = menus
    .filter((x) => x.location === 'menu')
    .filter((x) => !isMenuItemHidden(x, conditionCtx))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const showBottom =
    !readonly && (!item.config?.disabled_opacity || bottomMenus.length > 0);
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
          {extraMenus.map((menu, i) => (
            <DatasetMenuButton
              key={i}
              menu={menu}
              item={item}
              mapId={mapId}
              disabled={isMenuItemDisabled(menu, conditionCtx)}
              onAction={onAction}
            />
          ))}
          {!readonly && !item.config?.disabled_delete && (
            <MapControlButton
              variant="plain"
              size="small"
              onClick={() => onRemove?.(item)}
            >
              <Icon path={mdiDelete} size={ICON_SIZE} />
            </MapControlButton>
          )}
          {contentMenus.length > 0 && (
            <MapControlButton
              variant="plain"
              size="small"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onContextMenu?.({ event, actions: contentMenus, item });
              }}
            >
              <Icon path={mdiDotsVertical} size={ICON_SIZE} />
            </MapControlButton>
          )}
          {!showBottom && (
            <>
              {bottomMenus.map((menu, i) => (
                <DatasetMenuButton
                  key={i}
                  menu={menu}
                  item={item}
                  mapId={mapId}
                  disabled={isMenuItemDisabled(menu, conditionCtx)}
                  onAction={onAction}
                />
              ))}
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
          {preBottomMenus.map((menu, i) => (
            <DatasetMenuButton
              key={i}
              menu={menu}
              item={item}
              mapId={mapId}
              disabled={isMenuItemDisabled(menu, conditionCtx)}
              onAction={onAction}
            />
          ))}
          <div className="v-spacer" />
          {bottomMenus.map((menu, i) => (
            <DatasetMenuButton
              key={i}
              menu={menu}
              item={item}
              mapId={mapId}
              disabled={isMenuItemDisabled(menu, conditionCtx)}
              onAction={onAction}
            />
          ))}
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
              onAction={onAction}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
}
