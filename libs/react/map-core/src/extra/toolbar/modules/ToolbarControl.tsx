import {
  MAP_BUTTON_SIZE_PX,
  type Position,
  type WithMapPropType,
} from '@hungpvq/map-core';
import type {
  MapControlButtonState,
  MapControlIcon,
} from '@hungpvq/map-core/toolbar';
import {
  groupToolbarButtons,
  handleToolbarButtonClick,
  mdiButtonState,
  measureCornerMenuUsedPx,
  measureCornerStandaloneReserved,
  planToolbarExpansion,
  planToolbarLayout,
  shouldCloseExpandedOnOutsideClick,
  TOOLBAR_EXPAND_OUTSIDE_IGNORE_SELECTOR,
  toolbarAvailableWidth,
  toolbarOverflowPanelClassName,
} from '@hungpvq/map-core/toolbar';
import { mdiClose, mdiDotsHorizontal } from '@mdi/js';
import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { MapCommonButton } from '../../../components/MapCommonButton';
import { MapControlGroupButton } from '../../../components/MapControlGroupButton';
import { MapContext } from '../../../context/MapContext';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useLang } from '../../lang/hook';
import { useMapToolbar } from '../store';

const CORNER_POSITIONS: Position[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

function isSameReserved(
  a: Partial<Record<Position, { width: number; height: number }>>,
  b: Partial<Record<Position, { width: number; height: number }>>,
): boolean {
  for (const position of CORNER_POSITIONS) {
    const itemA = a[position];
    const itemB = b[position];
    if (!itemA && !itemB) continue;
    if (!itemA || !itemB) return false;
    if (itemA.width !== itemB.width || itemA.height !== itemB.height) {
      return false;
    }
  }
  return true;
}

function isSameUsed(
  a: Partial<Record<Position, number>>,
  b: Partial<Record<Position, number>>,
): boolean {
  for (const position of CORNER_POSITIONS) {
    if (a[position] !== b[position]) return false;
  }
  return true;
}

function isSameIcon(a?: MapControlIcon, b?: MapControlIcon): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.type !== b.type) return false;
  if (a.type === 'mdi' && b.type === 'mdi') return a.path === b.path;
  if (a.type === 'compass' && b.type === 'compass') return a.transform === b.transform;
  return true;
}

function isSameButton(a: MapControlButtonState, b: MapControlButtonState): boolean {
  return (
    a.id === b.id &&
    a.visible === b.visible &&
    a.loading === b.loading &&
    a.title === b.title &&
    a.text === b.text &&
    a.active === b.active &&
    a.disabled === b.disabled &&
    a.group === b.group &&
    a.order === b.order &&
    a.position === b.position &&
    a.orientation === b.orientation &&
    a.expandable === b.expandable &&
    a.role === b.role &&
    a.closeOnOutsideClick === b.closeOnOutsideClick &&
    isSameIcon(a.icon, b.icon)
  );
}

function isSameButtons(
  a: MapControlButtonState[],
  b: MapControlButtonState[],
): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!isSameButton(a[i], b[i])) return false;
  }
  return true;
}

export type ToolbarControlProps = Omit<WithMapPropType, 'controlLayout'> & {
  maxVisible?: number;
  children?: ReactNode;
};

export function ToolbarControl(props: ToolbarControlProps) {
  const merged = {
    ...defaultMapProps,
    position: 'top-left' as const,
    ...props,
  };
  const { moduleContainerProps, mapId } = useMap({
    ...merged,
    controlId: 'mapToolbarControl',
    controlLayout: 'button',
  });
  const mapContext = useContext(MapContext);
  const menuMode =
    !!mapContext?.isMobile && mapContext?.buttonInMobile === 'menu';

  const { trans } = useLang(mapId);
  const [buttons, setButtons] = useState<MapControlButtonState[]>([]);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreOpenCorner, setMoreOpenCorner] = useState<Position | null>(null);
  const [availableWidth, setAvailableWidth] = useState(() =>
    typeof window === 'undefined'
      ? 0
      : toolbarAvailableWidth(window.innerWidth),
  );
  const [hostHeight, setHostHeight] = useState(0);
  const [reservedByCorner, setReservedByCorner] = useState<
    Partial<Record<Position, { width: number; height: number }>>
  >({});
  const [menuUsedByCorner, setMenuUsedByCorner] = useState<
    Partial<Record<Position, number>>
  >({});
  const rootRef = useRef<HTMLDivElement | null>(null);
  const storeApi = useMapToolbar(mapId);

  const findMapContainer = useCallback(() => {
    const fromRef = rootRef.current?.closest('.map-container');
    if (fromRef instanceof HTMLElement) return fromRef;
    const fromContent = document
      .getElementById(mapId)
      ?.closest('.map-container');
    return fromContent instanceof HTMLElement ? fromContent : null;
  }, [mapId]);

  const syncHost = useCallback(() => {
    const el = findMapContainer();
    if (el) {
      const nextHostHeight = el.clientHeight;
      const nextAvailableWidth = toolbarAvailableWidth(el.clientWidth);
      setHostHeight((prev) => (prev === nextHostHeight ? prev : nextHostHeight));
      setAvailableWidth((prev) =>
        prev === nextAvailableWidth ? prev : nextAvailableWidth,
      );
    } else {
      const nextAvailableWidth = toolbarAvailableWidth(
        typeof window === 'undefined' ? 0 : window.innerWidth,
      );
      setHostHeight((prev) => (prev === 0 ? prev : 0));
      setAvailableWidth((prev) =>
        prev === nextAvailableWidth ? prev : nextAvailableWidth,
      );
    }

    if (!menuMode) {
      setReservedByCorner((prev) =>
        Object.keys(prev).length === 0 ? prev : {},
      );
      setMenuUsedByCorner((prev) =>
        Object.keys(prev).length === 0 ? prev : {},
      );
      return;
    }
    const nextReserved: Partial<
      Record<Position, { width: number; height: number }>
    > = {};
    const nextUsed: Partial<Record<Position, number>> = {};
    for (const position of CORNER_POSITIONS) {
      const host = document.getElementById(`${position}-${mapId}`);
      nextReserved[position] = measureCornerStandaloneReserved(host);
      const used = measureCornerMenuUsedPx(host);
      if (used != null) nextUsed[position] = used;
    }
    setReservedByCorner((prev) =>
      isSameReserved(prev, nextReserved) ? prev : nextReserved,
    );
    setMenuUsedByCorner((prev) =>
      isSameUsed(prev, nextUsed) ? prev : nextUsed,
    );
  }, [findMapContainer, mapId, menuMode]);

  useEffect(() => {
    const syncButtons = () => {
      const expanded = storeApi.getExpandedModuleId();
      setExpandedModuleId((prev) => (prev === expanded ? prev : expanded));
      const nextButtons = storeApi.getAll({ location: 'toolbar' });
      setButtons((prev) => (isSameButtons(prev, nextButtons) ? prev : nextButtons));
    };
    const unsub = storeApi.subscribe(syncButtons);
    syncButtons();
    return unsub;
  }, [storeApi]);

  useEffect(() => {
    syncHost();
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => syncHost())
        : undefined;
    const mapEl = findMapContainer();
    if (observer && mapEl) observer.observe(mapEl);
    if (observer && menuMode) {
      for (const position of CORNER_POSITIONS) {
        const host = document.getElementById(`${position}-${mapId}`);
        if (host) observer.observe(host);
      }
    }
    window.addEventListener('resize', syncHost);
    const onDoc = (e: MouseEvent) => {
      const t = e.target;
      const inside =
        t instanceof Element &&
        t.closest(TOOLBAR_EXPAND_OUTSIDE_IGNORE_SELECTOR);
      if (!inside) {
        setMoreOpen(false);
        setMoreOpenCorner(null);
        const expanded = storeApi.getExpandedModuleId();
        const currentButtons = storeApi.getAll({ location: 'toolbar' });
        if (
          expanded &&
          shouldCloseExpandedOnOutsideClick(currentButtons, expanded)
        ) {
          storeApi.setExpandedModule(null);
        }
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        setMoreOpenCorner(null);
        storeApi.setExpandedModule(null);
      }
    };
    document.addEventListener('pointerdown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', syncHost);
      document.removeEventListener('pointerdown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuMode, mapId, findMapContainer, syncHost, storeApi]);

  const expansion = useMemo(
    () => planToolbarExpansion(groupToolbarButtons(buttons), expandedModuleId),
    [buttons, expandedModuleId],
  );

  const primaryButtons = useMemo(
    () => expansion.primaryGroups.flatMap((g) => g.buttons),
    [expansion],
  );

  const secondaryButtons = expansion.secondaryButtons;
  const secondaryPosition = (secondaryButtons[0]?.position ||
    merged.position ||
    'bottom-right') as Position;

  const layout = useMemo(
    () =>
      planToolbarLayout({
        buttons: primaryButtons,
        menuMode,
        hostHeight,
        availableWidth,
        maxVisible: props.maxVisible,
        buttonSize: MAP_BUTTON_SIZE_PX.medium,
        reservedByCorner,
        menuUsedByCorner,
        cornerPositions: CORNER_POSITIONS,
      }),
    [
      primaryButtons,
      menuMode,
      hostHeight,
      availableWidth,
      props.maxVisible,
      reservedByCorner,
      menuUsedByCorner,
    ],
  );

  const { groups, toolbarSplit, corners: cornerData } = layout;
  const overflowOpen = moreOpen && toolbarSplit.overflow.length > 0;
  const pos = merged.position || 'bottom-right';
  const moreOption = mdiButtonState(mdiDotsHorizontal, {
    title: trans('map.toolbar.more'),
    active: moreOpen,
  });
  const closeOption = mdiButtonState(mdiClose, {
    title: trans('map.toolbar.close'),
    role: 'close',
  });

  const onToolbarButtonClick = useCallback(
    (btn: MapControlButtonState, e: MouseEvent) => {
      handleToolbarButtonClick(btn, e, storeApi);
      setMoreOpen(false);
      setMoreOpenCorner(null);
    },
    [storeApi],
  );

  useEffect(() => {
    if (!toolbarSplit.overflow.length && moreOpen) setMoreOpen(false);
  }, [toolbarSplit.overflow.length, moreOpen]);

  const secondaryRow = (buttonsForRow: MapControlButtonState[]) =>
    buttonsForRow.length ? (
      <div
        className="map-toolbar-secondary-row"
        role="toolbar"
      >
        <MapControlGroupButton row={buttonsForRow[0]?.orientation === 'row'}>
          <MapCommonButton
            option={closeOption}
            onClick={(e) => {
              e.stopPropagation();
              storeApi.setExpandedModule(null);
            }}
          />
          {buttonsForRow.map((btn) => (
            <MapCommonButton
              key={btn.id}
              option={btn}
              onClick={(e) => onToolbarButtonClick(btn, e.nativeEvent)}
            />
          ))}
        </MapControlGroupButton>
      </div>
    ) : null;

  if (menuMode) {
    const orphanSecondary =
      secondaryButtons.length > 0 &&
      !cornerData.some((c) => c.position === secondaryPosition);

    return (
      <div className="map-toolbar-menu-hosts">
        {cornerData.map((corner) => {
          const cornerMoreOpen = moreOpenCorner === corner.position;
          const moreOpt = mdiButtonState(mdiDotsHorizontal, {
            title: trans('map.toolbar.more'),
            active: cornerMoreOpen,
          });
          const toggleMore = (e: { stopPropagation: () => void }) => {
            e.stopPropagation();
            setMoreOpenCorner((cur) =>
              cur === corner.position ? null : corner.position,
            );
          };
          const cornerSecondary =
            secondaryPosition === corner.position ? secondaryButtons : [];
          return (
            <ModuleContainer
              key={corner.position}
              {...moduleContainerProps}
              position={corner.position}
              controlOrder={0}
              btn={
                <div
                  className="map-toolbar-control map-toolbar-corner"
                  data-position={corner.position}
                >
                  <div className="map-toolbar-corner-stack">
                    {corner.showMore && corner.prefer === 'end' ? (
                      <MapCommonButton
                        option={moreOpt}
                        aria-haspopup="true"
                        aria-expanded={cornerMoreOpen}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={toggleMore}
                      />
                    ) : null}
                    {corner.split.visible.map((group) => (
                      <MapControlGroupButton
                        key={group.id}
                        row={group.orientation === 'row'}
                      >
                        {group.buttons.map((btn) => (
                          <MapCommonButton
                            key={btn.id}
                            option={btn}
                            onClick={(e) =>
                              onToolbarButtonClick(btn, e.nativeEvent)
                            }
                          />
                        ))}
                      </MapControlGroupButton>
                    ))}
                    {secondaryRow(cornerSecondary)}
                    {corner.showMore && corner.prefer === 'start' ? (
                      <MapCommonButton
                        option={moreOpt}
                        aria-haspopup="true"
                        aria-expanded={cornerMoreOpen}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={toggleMore}
                      />
                    ) : null}
                  </div>
                </div>
              }
              btnOutside={
                corner.showMore && cornerMoreOpen ? (
                  <div
                    className="map-toolbar-overflow"
                    role="menu"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    {corner.split.overflow.map((group) => (
                      <MapControlGroupButton
                        key={group.id}
                        row
                      >
                        {group.buttons.map((btn) => (
                          <MapCommonButton
                            key={btn.id}
                            option={btn}
                            onClick={(e) => {
                              onToolbarButtonClick(btn, e.nativeEvent);
                              setMoreOpenCorner(null);
                            }}
                          />
                        ))}
                      </MapControlGroupButton>
                    ))}
                  </div>
                ) : null
              }
            />
          );
        })}
        {orphanSecondary ? (
          <ModuleContainer
            {...moduleContainerProps}
            position={secondaryPosition}
            controlOrder={0}
            btn={
              <div className="map-toolbar-control">
                {secondaryRow(secondaryButtons)}
              </div>
            }
          />
        ) : null}
        {props.children}
      </div>
    );
  }

  if (!groups.length && !secondaryButtons.length) {
    return (
      <ModuleContainer {...moduleContainerProps}>
        {props.children}
      </ModuleContainer>
    );
  }

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <div
          ref={rootRef}
          className="map-toolbar-control"
        >
          {toolbarSplit.visible.length || toolbarSplit.overflow.length ? (
            <MapControlGroupButton row>
              {toolbarSplit.visible.map((group) => (
                <MapControlGroupButton
                  key={group.id}
                  row
                >
                  {group.buttons.map((btn) => (
                    <MapCommonButton
                      key={btn.id}
                      option={btn}
                      onClick={(e) => onToolbarButtonClick(btn, e.nativeEvent)}
                    />
                  ))}
                </MapControlGroupButton>
              ))}
              {toolbarSplit.overflow.length ? (
                <MapCommonButton
                  option={moreOption}
                  aria-haspopup="true"
                  aria-expanded={overflowOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMoreOpen((open) => !open);
                  }}
                />
              ) : null}
            </MapControlGroupButton>
          ) : null}
          {overflowOpen ? (
            <div
              className={toolbarOverflowPanelClassName(pos)}
              role="menu"
            >
              {toolbarSplit.overflow.map((group) => (
                <MapControlGroupButton
                  key={group.id}
                  row
                >
                  {group.buttons.map((btn) => (
                    <MapCommonButton
                      key={btn.id}
                      option={btn}
                      onClick={(e) => {
                        onToolbarButtonClick(btn, e.nativeEvent);
                        setMoreOpen(false);
                      }}
                    />
                  ))}
                </MapControlGroupButton>
              ))}
            </div>
          ) : null}
          {secondaryRow(secondaryButtons)}
        </div>
      }
    >
      {props.children}
    </ModuleContainer>
  );
}
