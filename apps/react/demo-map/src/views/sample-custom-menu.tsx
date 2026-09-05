import type { IListViewUI, MenuAction } from '@hungpvq/map-dataset';
import { mdiChevronRight, mdiClose, mdiInformation, mdiStar } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

export const SAMPLE_LAYER_MENU_KEY = 'sample-layer-menu';

export function SampleCustomMenu({
  item,
  data,
  mapId,
  onClose,
}: {
  item: MenuAction<IListViewUI>;
  data?: IListViewUI;
  mapId?: string;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const name = 'name' in item ? item.name : 'Sample custom menu';

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
        <Icon path={mdiStar} size="16px" />
      </div>
      <span>{name}</span>
      <div className="layer-context-menu__chevron">
        <Icon path={mdiChevronRight} size="16px" />
      </div>
      <ul className="context-menu layer-context-menu layer-context-menu--submenu">
        <li
          className="layer-context-menu__item"
          onClick={(event) => {
            event.stopPropagation();
            console.info('[sample-layer-menu]', {
              mapId,
              layerId: data?.id,
              layerName: data?.getName?.(),
            });
          }}
        >
          <div className="layer-context-menu__item-icon">
            <Icon path={mdiInformation} size="16px" />
          </div>
          <span>Log layer (keep open)</span>
        </li>
        <li
          className="layer-context-menu__item"
          onClick={(event) => {
            event.stopPropagation();
            onClose?.();
          }}
        >
          <div className="layer-context-menu__item-icon">
            <Icon path={mdiClose} size="16px" />
          </div>
          <span>Done (close menu)</span>
        </li>
      </ul>
    </li>
  );
}
