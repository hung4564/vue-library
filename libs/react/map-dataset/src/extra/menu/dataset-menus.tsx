import type { IDataset } from '@hungpvq/map-dataset';
import type {
  ListViewGroupOption,
  MenuAction,
  MenuActionLocation,
  MenuContextSource,
} from '@hungpvq/map-dataset/menu';
import {
  createMenuConditionContext,
  getMenuItemLocation,
  handleMenuAction,
  isMenuItemCustomComponent,
  isMenuItemDisabled,
  partitionMenuActions,
} from '@hungpvq/map-dataset/menu';
import { MapControlButton, RegistryItem } from '@hungpvq/react-map-core';
import {
  ContextMenu,
  type ContextMenuRef,
} from '@hungpvq/react-draggable';
import { mdiCircleSmall, mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import { useMemo, useRef } from 'react';
import { useMenuConditionContext } from './condition-context';
import { DatasetMenuButton } from './dataset-menu-button';

const ICON_SIZE = '14px';

export function DatasetMenus<T extends IDataset = IDataset>({
  menus,
  data,
  mapId,
  value,
  locations = ['extra', 'menu'],
  disabled,
  className,
  getGroups,
  menuContext,
}: {
  /** Prefer `MenuAction[]`; `any` avoids variance friction with typed list menus. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  menus: MenuAction<any>[];
  data: T;
  mapId?: string;
  value?: unknown;
  locations?: MenuActionLocation[];
  disabled?: boolean;
  className?: string;
  getGroups?: () => ListViewGroupOption[];
  menuContext?: MenuContextSource | MenuContextSource[];
}) {
  const injectedMenuContext = useMenuConditionContext();
  const conditionCtx = useMemo(
    () =>
      createMenuConditionContext(data, {
        mapId,
        context: [
          injectedMenuContext as MenuContextSource,
          ...(Array.isArray(menuContext)
            ? menuContext
            : menuContext
              ? [menuContext]
              : []),
        ],
      }),
    [data, mapId, injectedMenuContext, menuContext],
  );

  const partitioned = useMemo(
    () => partitionMenuActions(menus as MenuAction[], conditionCtx),
    [menus, conditionCtx],
  );

  const locationSet = useMemo(() => new Set(locations), [locations]);

  const inlineMenus = useMemo(() => {
    const list: MenuAction[] = [];
    for (const loc of locations) {
      if (loc === 'menu') continue;
      list.push(...partitioned[loc]);
    }
    return list;
  }, [locations, partitioned]);

  const overflowMenus = useMemo(
    () => (locationSet.has('menu') ? partitioned.menu : []),
    [locationSet, partitioned],
  );

  const contextMenuRef = useRef<ContextMenuRef>(null);

  if (inlineMenus.length === 0 && overflowMenus.length === 0) {
    return null;
  }

  function isDisabled(option: MenuAction) {
    return isMenuItemDisabled(option, conditionCtx);
  }

  function runAction(menu: MenuAction, event: React.MouseEvent) {
    if (menu.type === 'divider') return;
    if (disabled || isDisabled(menu)) return;
    handleMenuAction(menu, {
      event: event.nativeEvent,
      layer: data,
      mapId: mapId ?? '',
      value,
    });
  }

  return (
    <div className={['dataset-menus', className].filter(Boolean).join(' ')}>
      {inlineMenus.map((menu, i) => (
        <DatasetMenuButton
          key={menu.id || `inline-${i}`}
          menu={menu as MenuAction<T>}
          item={data}
          mapId={mapId}
          disabled={disabled || isDisabled(menu)}
          onAction={({ event, action }) =>
            runAction(action as MenuAction, event)
          }
        />
      ))}
      {overflowMenus.length > 0 && (
        <>
          <MapControlButton
            variant="plain"
            size="small"
            disabled={disabled}
            aria-label="Open menu"
            aria-haspopup="menu"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              contextMenuRef.current?.open(event);
            }}
          >
            <Icon path={mdiDotsVertical} size={ICON_SIZE} />
          </MapControlButton>
          <ContextMenu ref={contextMenuRef}>
            <ul className="context-menu layer-context-menu dataset-menus__context">
              {overflowMenus.map((option, index) => {
                const key = option.id || String(index);
                const itemDisabled = disabled || isDisabled(option);
                if (isMenuItemCustomComponent(option)) {
                  return (
                    <RegistryItem
                      key={key}
                      componentKey={option.componentMenuKey}
                      item={option}
                      data={data}
                      mapId={mapId}
                      getGroups={getGroups}
                      disabled={itemDisabled}
                      location={getMenuItemLocation(option)}
                      onClose={() => contextMenuRef.current?.close()}
                    />
                  );
                }
                return (
                  <li
                    key={key}
                    className={[
                      'layer-context-menu__item',
                      option.type === 'divider'
                        ? 'layer-context-menu__divider'
                        : '',
                      itemDisabled ? 'is-disabled' : '',
                      option.class || '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (option.type === 'divider' || itemDisabled) return;
                      runAction(option, event);
                      contextMenuRef.current?.close();
                    }}
                  >
                    {option.type === 'divider' ? (
                      <div className="layer-context-menu__divider-line" />
                    ) : (
                      <>
                        <div className="layer-context-menu__item-icon">
                          <Icon
                            path={
                              ('icon' in option && option.icon) ||
                              mdiCircleSmall
                            }
                            size="16px"
                          />
                        </div>
                        <span>
                          {('name' in option && option.name) || ''}
                        </span>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </ContextMenu>
        </>
      )}
    </div>
  );
}
