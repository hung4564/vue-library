import type { MenuAction } from '@hungpvq/map-dataset';
import {
  createAddToGroupSubmenu,
  getListViewGroupInfo,
  handleMenuAction,
} from '@hungpvq/map-dataset';
import { mdiChevronRight, mdiCircleSmall, mdiFolderPlusOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';
import type { WithLayerItemMenuComponentType } from './types';

export function AddToGroup(props: WithLayerItemMenuComponentType) {
  const [open, setOpen] = useState(false);
  const groups = props.getGroups?.() ?? [];
  const excludeGroupId = getListViewGroupInfo(props.data?.group)?.id;
  const children = createAddToGroupSubmenu(groups, excludeGroupId);
  const name = 'name' in props.item ? props.item.name : 'Add to group';
  const icon =
    ('icon' in props.item && props.item.icon) || mdiFolderPlusOutline;

  function onChildClick(action: MenuAction, event: React.MouseEvent) {
    event.stopPropagation();
    if (!props.data) return;
    handleMenuAction(action, {
      event: event.nativeEvent,
      layer: props.data,
      mapId: props.mapId,
      value: props.data,
    });
    props.onClose?.();
  }

  return (
    <li
      className={[
        'layer-context-menu__item',
        'layer-context-menu__item--has-children',
        open ? 'is-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(event) => {
        event.stopPropagation();
        setOpen((prev) => !prev);
      }}
    >
      <div className="layer-context-menu__item-icon">
        <Icon path={icon} size="16px" />
      </div>
      <span>{name}</span>
      <div className="layer-context-menu__chevron">
        <Icon path={mdiChevronRight} size="16px" />
      </div>
      <ul className="context-menu layer-context-menu layer-context-menu--submenu">
        {children.map((child, index) => {
          const key = child.id || String(index);
          if (child.type === 'divider') {
            return (
              <li
                key={key}
                className="layer-context-menu__item layer-context-menu__divider"
              >
                <div className="layer-context-menu__divider-line" />
              </li>
            );
          }
          return (
            <li
              key={key}
              className="layer-context-menu__item"
              onClick={(event) => onChildClick(child, event)}
            >
              <div className="layer-context-menu__item-icon">
                <Icon
                  path={('icon' in child && child.icon) || mdiCircleSmall}
                  size="16px"
                />
              </div>
              <span>{('name' in child && child.name) || ''}</span>
            </li>
          );
        })}
      </ul>
    </li>
  );
}
