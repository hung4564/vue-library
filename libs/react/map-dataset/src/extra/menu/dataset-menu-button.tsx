import type { IDataset } from '@hungpvq/map-dataset';
import type { MenuAction } from '@hungpvq/map-dataset/menu';
import { getMenuItemLocation } from '@hungpvq/map-dataset/menu';
import { BaseButton, RegistryItem } from '@hungpvq/react-map-core';
import Icon from '@mdi/react';

const ICON_SIZE = '14px';

export function DatasetMenuButton<T extends IDataset = IDataset>({
  menu,
  item,
  mapId,
  disabled,
  onClick,
  onAction,
}: {
  menu: MenuAction<T>;
  item?: T;
  mapId?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onAction?: (payload: {
    event: React.MouseEvent;
    action: MenuAction<T>;
    item: T;
  }) => void;
}) {
  if (menu.type === 'divider') {
    return <div className="menu-divider" />;
  }

  if (menu.type === 'item' && 'componentKey' in menu && mapId) {
    return (
      <RegistryItem
        componentKey={menu.componentKey}
        mapId={mapId}
        item={menu}
        data={item}
        disabled={disabled}
        location={getMenuItemLocation(menu)}
      />
    );
  }

  const title = 'name' in menu ? menu.name : '';
  const icon = 'icon' in menu ? menu.icon : undefined;

  return (
    <BaseButton
      className="menu-item"
      disabled={disabled}
      title={title}
      onClick={(event) => {
        if (disabled) return;
        onClick?.(event);
        if (item) {
          onAction?.({ event, action: menu, item });
        }
      }}
    >
      {icon ? <Icon path={icon} size={ICON_SIZE} /> : title}
    </BaseButton>
  );
}
