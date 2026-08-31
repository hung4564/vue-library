import type { IListViewUI, MenuAction } from '@hungpvq/map-dataset';
import { BaseButton, RegistryItem } from '@hungpvq/react-map-core';
import { SetOpacity } from '../../extra/component/set-opacity';
import { ToggleShow } from '../../extra/component/toggle-show';
import Icon from '@mdi/react';

const ICON_SIZE = '14px';

export function LayerMenuButton({
  menu,
  item,
  mapId,
  disabled,
  onAction,
}: {
  menu: MenuAction<IListViewUI>;
  item: IListViewUI;
  mapId: string;
  disabled?: boolean;
  onAction?: (payload: {
    event: React.MouseEvent;
    action: MenuAction<IListViewUI>;
    item: IListViewUI;
  }) => void;
}) {
  if (menu.type === 'divider') return null;

  if (menu.type === 'item' && 'componentKey' in menu) {
    if (menu.componentKey === 'layer-action-toggle-show') {
      return <ToggleShow item={menu} data={item} mapId={mapId} disabled={disabled} />;
    }
    if (menu.componentKey === 'layer-action-set-opacity') {
      return <SetOpacity item={menu} data={item} mapId={mapId} disabled={disabled} />;
    }
    return (
      <RegistryItem
        componentKey={menu.componentKey}
        mapId={mapId}
        item={menu}
        data={item}
        disabled={disabled}
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
      onClick={(event) => onAction?.({ event, action: menu, item })}
    >
      {icon ? <Icon path={icon} size={ICON_SIZE} /> : title}
    </BaseButton>
  );
}
