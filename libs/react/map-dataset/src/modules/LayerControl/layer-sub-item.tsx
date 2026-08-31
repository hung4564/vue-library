import type { IListViewUI, MenuAction } from '@hungpvq/map-dataset';
import { BaseButton, RegistryItem } from '@hungpvq/react-map-core';
import { mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import { useMemo } from 'react';
import { LayerMenuButton } from './layer-menu-button';

const ICON_SIZE = '14px';

export function LayerSubItem({
  item,
  mapId,
  onAction,
  onContextMenu,
}: {
  item: IListViewUI;
  mapId: string;
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
}) {
  const menus = useMemo(
    () => (item.getMenus?.() || []) as MenuAction<IListViewUI>[],
    [item],
  );
  const extraMenus = menus
    .filter((x) => x.location !== 'menu')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const contentMenus = menus
    .filter((x) => x.location === 'menu')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="layer-sub-item-container">
      <div className="layer-sub-item__info">
        {item.icon?.componentKey && (
          <div className="layer-sub-item__icon">
            <RegistryItem
              componentKey={item.icon.componentKey}
              mapId={mapId}
              {...item.icon.attr}
              data={item}
            />
          </div>
        )}
        <span className="layer-sub-item__title" title={item.getName()}>
          <span>{item.getName()}</span>
        </span>
        <div className="layer-sub-item__title-action">
          {extraMenus.map((menu, i) => (
            <LayerMenuButton
              key={i}
              menu={menu}
              item={item}
              mapId={mapId}
              onAction={onAction}
            />
          ))}
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
        </div>
      </div>
    </div>
  );
}
