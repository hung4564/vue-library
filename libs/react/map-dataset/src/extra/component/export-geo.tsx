import type { MenuAction } from '@hungpvq/map-dataset';
import {
  createExportGeoSubmenu,
  getExportGeoMenuOptions,
  handleMenuAction,
} from '@hungpvq/map-dataset';
import { mdiChevronRight, mdiDownload } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';
import type { WithLayerItemMenuComponentType } from './types';

export function ExportGeo(props: WithLayerItemMenuComponentType) {
  const [open, setOpen] = useState(false);
  const children = createExportGeoSubmenu(getExportGeoMenuOptions(props.item));
  const name = 'name' in props.item ? props.item.name : 'Export';
  const icon = ('icon' in props.item && props.item.icon) || mdiDownload;

  function onChildClick(action: MenuAction, event: React.MouseEvent) {
    event.stopPropagation();
    if (!props.data || props.disabled) return;
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
        props.disabled ? 'is-disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(event) => {
        event.stopPropagation();
        if (props.disabled) return;
        setOpen((prev) => !prev);
      }}
    >
      <div className="layer-context-menu__item-icon">
        <Icon path={icon} size={16 / 24} />
      </div>
      <span>{name}</span>
      <div className="layer-context-menu__chevron">
        <Icon path={mdiChevronRight} size={16 / 24} />
      </div>
      <ul className="context-menu layer-context-menu layer-context-menu--submenu">
        {children.map((child, index) => (
          <li
            key={child.id || String(index)}
            className="layer-context-menu__item"
            onClick={(event) => onChildClick(child, event)}
          >
            <div className="layer-context-menu__item-icon">
              <Icon
                path={('icon' in child && child.icon) || mdiDownload}
                size={16 / 24}
              />
            </div>
            <span>{('name' in child && child.name) || ''}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}
