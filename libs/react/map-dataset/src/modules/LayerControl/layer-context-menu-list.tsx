import type {
  IListViewUI,
  ListViewGroupOption,
  MenuAction,
} from '@hungpvq/map-dataset';
import {
  createMenuConditionContext,
  isMenuItemCustomComponent,
  isMenuItemDisabled,
  isMenuItemHidden,
} from '@hungpvq/map-dataset';
import { RegistryItem } from '@hungpvq/react-map-core';
import { mdiCircleSmall } from '@mdi/js';
import Icon from '@mdi/react';
import { useMenuConditionContext } from '../../extra/menu/condition-context';

export function LayerContextMenuList({
  items,
  view,
  mapId,
  getGroups,
  onSelect,
  onClose,
}: {
  items: MenuAction<IListViewUI>[];
  view?: IListViewUI;
  mapId?: string;
  getGroups?: () => ListViewGroupOption[];
  onSelect: (payload: {
    action: MenuAction<IListViewUI>;
    event: React.MouseEvent;
  }) => void;
  onClose?: () => void;
}) {
  const injectedMenuContext = useMenuConditionContext();
  const conditionCtx = view
    ? createMenuConditionContext(view, {
        mapId,
        context: [injectedMenuContext],
      })
    : undefined;
  const visibleItems = conditionCtx
    ? items.filter((item) => !isMenuItemHidden(item, conditionCtx))
    : items;

  return (
    <ul className="context-menu layer-context-menu">
      {visibleItems.map((option, index) => {
        const key = option.id || String(index);
        const disabled = conditionCtx
          ? isMenuItemDisabled(option, conditionCtx)
          : false;
        if (isMenuItemCustomComponent(option)) {
          return (
            <RegistryItem
              key={key}
              componentKey={option.componentMenuKey}
              item={option}
              data={view}
              mapId={mapId}
              getGroups={getGroups}
              disabled={disabled}
              onClose={onClose}
            />
          );
        }
        return (
          <li
            key={key}
            className={[
              'layer-context-menu__item',
              option.type === 'divider' ? 'layer-context-menu__divider' : '',
              disabled ? 'is-disabled' : '',
              option.class || '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={(event) => {
              event.stopPropagation();
              if (option.type === 'divider' || disabled) return;
              onSelect({ action: option, event });
            }}
          >
            {option.type === 'divider' ? (
              <div className="layer-context-menu__divider-line" />
            ) : (
              <>
                <div className="layer-context-menu__item-icon">
                  <Icon
                    path={('icon' in option && option.icon) || mdiCircleSmall}
                    size="16px"
                  />
                </div>
                <span>{('name' in option && option.name) || ''}</span>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
