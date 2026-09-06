import type { WithLayerItemMenuComponentType } from '@hungpvq/map-dataset';
import {
  IDENTIFY_CONTROL,
  isListIdentifyActive,
  resolveMenuItemLocation,
  subscribeIdentifyScope,
  toggleListIdentifyScope,
} from '@hungpvq/map-dataset';
import { BaseButton, UniversalRegistry } from '@hungpvq/react-map-core';
import { mdiCursorPointer } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useMemo, useState } from 'react';

const ICON_SIZE_EXTRA = '14px';
const ICON_SIZE_MENU = '16px';

export function IdentifyLayerAction(props: WithLayerItemMenuComponentType) {
  const {
    item,
    data,
    mapId,
    disabled,
    location: locationProp,
    onClose,
  } = props;

  const location = useMemo(
    () => resolveMenuItemLocation(item, locationProp),
    [item, locationProp],
  );

  const isMenuLocation = location === 'menu';

  const title =
    item.type === 'item' && 'name' in item && item.name
      ? item.name
      : 'Identify';
  const iconPath =
    item.type === 'item' && 'icon' in item && item.icon
      ? item.icon
      : mdiCursorPointer;

  const [isActive, setIsActive] = useState(() =>
    isListIdentifyActive(mapId, data),
  );

  useEffect(() => {
    return subscribeIdentifyScope(mapId, () => {
      setIsActive(isListIdentifyActive(mapId, data));
    });
  }, [mapId, data]);

  function onToggle(event: React.MouseEvent) {
    event.stopPropagation();
    if (disabled) return;
    const result = toggleListIdentifyScope(mapId, data);
    UniversalRegistry.runControlAction(
      mapId,
      IDENTIFY_CONTROL.id,
      IDENTIFY_CONTROL.actionSetScoped,
      result,
    );
    setIsActive(isListIdentifyActive(mapId, data));
    if (isMenuLocation) {
      onClose?.();
    }
  }

  if (isMenuLocation) {
    return (
      <li
        className={[
          'layer-context-menu__item',
          isActive ? '_active' : '',
          disabled ? 'is-disabled' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={onToggle}
      >
        <div className="layer-context-menu__item-icon">
          <Icon path={iconPath} size={ICON_SIZE_MENU} />
        </div>
        <span>{title}</span>
      </li>
    );
  }

  return (
    <BaseButton
      className={['menu-item', isActive ? '_active' : '']
        .filter(Boolean)
        .join(' ')}
      active={isActive}
      title={title}
      disabled={disabled}
      onClick={onToggle}
    >
      <Icon path={iconPath} size={ICON_SIZE_EXTRA} />
    </BaseButton>
  );
}
