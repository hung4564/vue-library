import type { MenuAction } from '@hungpvq/map-dataset';
import { BaseButton } from '@hungpvq/react-map-core';
import Icon from '@mdi/react';

const ICON_SIZE = 14 / 24;

export function IdentifyMenuItem({
  item,
  onClick,
}: {
  item: MenuAction;
  onClick: (event: React.MouseEvent) => void;
}) {
  if (item.type === 'divider') {
    return <div className="identify-control-menu-divider" />;
  }

  const title = 'name' in item ? item.name : '';
  const icon = 'icon' in item ? item.icon : undefined;

  return (
    <BaseButton className="menu-item" title={title} onClick={onClick}>
      {icon ? <Icon path={icon} size={ICON_SIZE} /> : title}
    </BaseButton>
  );
}
