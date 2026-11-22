import type { IListViewUI } from '@hungpvq/map-dataset';
import type {
  ListViewGroupOption,
  MenuAction,
  MenuContextSource,
} from '@hungpvq/map-dataset/menu';
import { getResolvedMenus } from '@hungpvq/map-dataset/menu';
import { MapControlButton, RegistryItem } from '@hungpvq/react-map-core';
import Icon from '@mdi/react';
import { mdiDelete } from '@mdi/js';
import { useMemo } from 'react';

import { DatasetMenus } from '../../../../extra/menu/dataset-menus';

export function LayerSubItem({
  item,
  mapId,
  readonly,
  disabledMove,
  disabledCreateGroup,
  getGroups,
  menuContext,
  onRemove,
}: {
  item: IListViewUI;
  mapId: string;
  readonly?: boolean;
  disabledMove?: boolean;
  disabledCreateGroup?: boolean;
  getGroups?: () => ListViewGroupOption[];
  menuContext?: MenuContextSource;
  onRemove?: (item: IListViewUI) => void;
}) {
  const menus = useMemo(
    () => getResolvedMenus(item, 'layer') as MenuAction<IListViewUI>[],
    [item],
  );
  const rowMenuContexts = useMemo(
    () =>
      [
        {
          readonly,
          disabledMove,
          disabledCreateGroup,
        },
        menuContext,
      ] as MenuContextSource[],
    [readonly, disabledMove, disabledCreateGroup, menuContext],
  );

  const showDelete = !readonly && item.config?.disabled_delete === false;

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
        <span
          className="layer-sub-item__title"
          title={item.getName()}
        >
          <span>{item.getName()}</span>
        </span>
        <div className="layer-sub-item__title-action">
          <DatasetMenus
            menus={menus}
            data={item}
            mapId={mapId}
            locations={['extra', 'menu']}
            getGroups={getGroups}
            menuContext={rowMenuContexts}
          />
          {showDelete && (
            <MapControlButton
              variant="plain"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.(item);
              }}
            >
              <Icon
                path={mdiDelete}
                size={14}
              />
            </MapControlButton>
          )}
        </div>
      </div>
    </div>
  );
}
