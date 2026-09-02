import type { IListViewUI, MenuAction } from '@hungpvq/map-dataset';
import {
  createMenuConditionContext,
  isMenuItemDisabled,
  isMenuItemHidden,
} from '@hungpvq/map-dataset';
import { BaseButton, RegistryItem } from '@hungpvq/react-map-core';
import { mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import { useMemo } from 'react';
import { useMenuConditionContext } from '../../extra/menu/condition-context';
import { LayerMenuButton } from './layer-menu-button';

const ICON_SIZE = '14px';

export function LayerSubItem({
  item,
  mapId,
  readonly,
  disabledMove,
  disabledCreateGroup,
  onAction,
  onContextMenu,
}: {
  item: IListViewUI;
  mapId: string;
  readonly?: boolean;
  disabledMove?: boolean;
  disabledCreateGroup?: boolean;
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
    () => (item.getMenus?.() || []) as MenuAction<IListViewUI>[],
    [item],
  );
  const extraMenus = menus
    .filter((x) => !x.location || x.location === 'extra')
    .filter((x) => !isMenuItemHidden(x, conditionCtx))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const contentMenus = menus
    .filter((x) => x.location === 'menu')
    .filter((x) => !isMenuItemHidden(x, conditionCtx))
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
              disabled={isMenuItemDisabled(menu, conditionCtx)}
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
