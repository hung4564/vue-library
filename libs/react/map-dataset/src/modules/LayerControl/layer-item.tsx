import type { IListViewUI, MenuAction } from '@hungpvq/map-dataset';
import { findAllComponentsByType } from '@hungpvq/map-dataset';
import { BaseButton, RegistryItem, useShow } from '@hungpvq/react-map-core';
import { mdiDelete, mdiDotsVertical, mdiMenuDown, mdiMenuLeft } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useMemo, useState } from 'react';
import { LayerMenuButton } from './layer-menu-button';
import { LayerSubItem } from './layer-sub-item';

const ICON_SIZE = '14px';

export function LayerItem({
  item,
  mapId,
  readonly,
  onRemove,
  onAction,
  onContextMenu,
  onTitleClick,
}: {
  item: IListViewUI;
  mapId: string;
  readonly?: boolean;
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
  }, [item]);

  const menus = useMemo(
    () => (item.getMenus?.() || []) as MenuAction<IListViewUI>[],
    [item],
  );
  const extraMenus = menus
    .filter((x) => !x.location || x.location === 'extra')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const preBottomMenus = menus
    .filter((x) => x.location === 'prebottom')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const bottomMenus = menus
    .filter((x) => x.location === 'bottom')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const contentMenus = menus
    .filter((x) => x.location === 'menu')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const showBottom =
    !readonly && (!item.config?.disabled_opacity || bottomMenus.length > 0);

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
          {item.getName()}
        </span>
        <div className="v-spacer" />
        <div className="layer-item__title-action">
          {extraMenus.map((menu, i) => (
            <LayerMenuButton
              key={i}
              menu={menu}
              item={item}
              mapId={mapId}
              onAction={onAction}
            />
          ))}
          {!readonly && !item.config?.disabled_delete && (
            <BaseButton onClick={() => onRemove?.(item)}>
              <Icon path={mdiDelete} size={ICON_SIZE} />
            </BaseButton>
          )}
          {contentMenus.length > 0 && (
            <BaseButton
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onContextMenu?.({ event, actions: contentMenus, item });
              }}
            >
              <Icon path={mdiDotsVertical} size={ICON_SIZE} />
            </BaseButton>
          )}
          {!showBottom && (
            <>
              {bottomMenus.map((menu, i) => (
                <LayerMenuButton
                  key={i}
                  menu={menu}
                  item={item}
                  mapId={mapId}
                  onAction={onAction}
                />
              ))}
              {item.legend && (
                <BaseButton onClick={() => toggleLegend()}>
                  <Icon
                    path={legendShow ? mdiMenuDown : mdiMenuLeft}
                    size={ICON_SIZE}
                  />
                </BaseButton>
              )}
            </>
          )}
        </div>
      </div>
      {showBottom && (
        <div className="layer-item__action">
          {preBottomMenus.map((menu, i) => (
            <LayerMenuButton
              key={i}
              menu={menu}
              item={item}
              mapId={mapId}
              onAction={onAction}
            />
          ))}
          <div className="v-spacer" />
          {bottomMenus.map((menu, i) => (
            <LayerMenuButton
              key={i}
              menu={menu}
              item={item}
              mapId={mapId}
              onAction={onAction}
            />
          ))}
          {children.length > 0 && (
            <BaseButton onClick={() => toggleChildren()}>
              <Icon
                path={childrenShow ? mdiMenuDown : mdiMenuLeft}
                size={ICON_SIZE}
              />
            </BaseButton>
          )}
          {item.legend && (
            <BaseButton onClick={() => toggleLegend()}>
              <Icon
                path={legendShow ? mdiMenuDown : mdiMenuLeft}
                size={ICON_SIZE}
              />
            </BaseButton>
          )}
        </div>
      )}
      {legendShow && item.legend && (
        <RegistryItem
          componentKey={item.legend.componentKey}
          mapId={mapId}
          data={item}
          {...item.legend.attr}
        />
      )}
      {childrenShow && children.length > 0 && (
        <div className="layer-item__children">
          {children.map((child) => (
            <LayerSubItem
              key={child.id}
              item={child}
              mapId={mapId}
              onAction={onAction}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
}
