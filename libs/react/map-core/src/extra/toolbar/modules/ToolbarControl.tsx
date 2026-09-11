import {
  MAP_BUTTON_SIZE_PX,
  type Position,
  type WithMapPropType,
} from '@hungpvq/map-core';
import type { MapControlButtonState } from '@hungpvq/map-core/toolbar';
import {
  TOOLBAR_CONTROL_LOCALE,
  cornerVerticalMenuBudgetsPx,
  createToolbarStoreApi,
  groupToolbarButtons,
  maxVisibleButtonsInStackHeight,
  maxVisibleToolbarButtons,
  mdiButtonState,
  measureCornerMenuUsedPx,
  measureCornerStandaloneReserved,
  splitToolbarOverflow,
  splitToolbarOverflowKeepGroups,
  toolbarAvailableWidth,
} from '@hungpvq/map-core/toolbar';
import { mdiDotsHorizontal } from '@mdi/js';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MapCommonButton } from '../../../components/MapCommonButton';
import { MapControlGroupButton } from '../../../components/MapControlGroupButton';
import { MapContext } from '../../../context/MapContext';
import { defaultMapProps, useMap } from '../../../hooks';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useLang } from '../../lang';
import { useMapToolbarStore } from '../store';

const CORNER_POSITIONS: Position[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

export type ToolbarControlProps = Omit<
  WithMapPropType,
  'controlLayout' | 'controlVisible'
> & {
  maxVisible?: number;
};

function overflowClassFor(position: Position) {
  return [
    'map-toolbar-overflow',
    position.startsWith('top')
      ? 'map-toolbar-overflow-top'
      : 'map-toolbar-overflow-bottom',
    position.endsWith('left')
      ? 'map-toolbar-overflow-left'
      : 'map-toolbar-overflow-right',
  ].join(' ');
}

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

  const { trans, setLocaleDefault } = useLang(mapId);
  const [buttons, setButtons] = useState<MapControlButtonState[]>([]);
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
  const toolbarStore = useMapToolbarStore(mapId);

  const findMapContainer = () => {
    const fromRef = rootRef.current?.closest('.map-container');
    if (fromRef instanceof HTMLElement) return fromRef;
    const fromContent = document
      .getElementById(mapId)
      ?.closest('.map-container');
    return fromContent instanceof HTMLElement ? fromContent : null;
  };

  const syncHost = () => {
    const el = findMapContainer();
    if (el) {
      setHostHeight(el.clientHeight);
      setAvailableWidth(toolbarAvailableWidth(el.clientWidth));
    } else {
      setHostHeight(0);
      setAvailableWidth(
        toolbarAvailableWidth(
          typeof window === 'undefined' ? 0 : window.innerWidth,
        ),
      );
    }

    if (!menuMode) {
      setReservedByCorner({});
      setMenuUsedByCorner({});
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
    setReservedByCorner(nextReserved);
    setMenuUsedByCorner(nextUsed);
  };

  useEffect(() => {
    setLocaleDefault(TOOLBAR_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  useEffect(() => {
    const store = createToolbarStoreApi(toolbarStore);
    const syncButtons = () => {
      setButtons(store.getAll().map((btn) => ({ ...btn })));
    };
    const unsub = store.subscribe(syncButtons);
    syncButtons();
    return unsub;
  }, [toolbarStore]);

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
      if (
        t instanceof Element &&
        t.closest('.map-toolbar-control, .map-toolbar-overflow')
      ) {
        return;
      }
      setMoreOpen(false);
      setMoreOpenCorner(null);
    };
    document.addEventListener('pointerdown', onDoc);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', syncHost);
      document.removeEventListener('pointerdown', onDoc);
    };
  }, [menuMode, mapId, buttons.length]);

  const groups = useMemo(() => groupToolbarButtons(buttons), [buttons]);
  const maxVisibleToolbar =
    props.maxVisible ??
    maxVisibleToolbarButtons(availableWidth, MAP_BUTTON_SIZE_PX.medium);
  const toolbarSplit = useMemo(
    () => splitToolbarOverflow(groups, maxVisibleToolbar),
    [groups, maxVisibleToolbar],
  );

  const cornerData = useMemo(() => {
    return CORNER_POSITIONS.map((position) => {
      const cornerGroups = groupToolbarButtons(
        buttons.filter((b) => (b.position || 'bottom-right') === position),
      );
      if (!cornerGroups.length) return null;
      const side = position.endsWith('left') ? 'left' : 'right';
      const budgets = cornerVerticalMenuBudgetsPx({
        hostHeight,
        topReservedPx: reservedByCorner[`top-${side}` as Position]?.height ?? 0,
        bottomReservedPx:
          reservedByCorner[`bottom-${side}` as Position]?.height ?? 0,
        topMenuUsedPx: menuUsedByCorner[`top-${side}` as Position],
        bottomMenuUsedPx: menuUsedByCorner[`bottom-${side}` as Position],
      });
      const budgetPx = position.startsWith('top')
        ? budgets.topPx
        : budgets.bottomPx;
      const prefer = position.startsWith('bottom') ? 'end' : 'start';
      const maxVisible =
        props.maxVisible ??
        maxVisibleButtonsInStackHeight(budgetPx, MAP_BUTTON_SIZE_PX.medium);
      const split = splitToolbarOverflowKeepGroups(
        cornerGroups,
        maxVisible,
        prefer,
      );
      return {
        position,
        prefer,
        maxVisible,
        split,
        showMore: split.overflow.length > 0 && maxVisible >= 1,
        hasChrome:
          cornerGroups.length > 0 &&
          (split.visible.length > 0 || maxVisible >= 1),
      };
    }).filter((c): c is NonNullable<typeof c> => c != null && c.hasChrome);
  }, [buttons, hostHeight, props.maxVisible, reservedByCorner, menuUsedByCorner]);

  const overflowOpen = moreOpen && toolbarSplit.overflow.length > 0;
  const pos = merged.position || 'bottom-right';
  const moreOption = mdiButtonState(mdiDotsHorizontal, {
    title: trans('map.toolbar.more'),
    active: moreOpen,
  });

  useEffect(() => {
    if (!toolbarSplit.overflow.length) setMoreOpen(false);
  }, [toolbarSplit.overflow.length]);

  if (menuMode) {
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
                            onClick={(e) => btn.action(e.nativeEvent)}
                          />
                        ))}
                      </MapControlGroupButton>
                    ))}
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
                      <MapControlGroupButton key={group.id} row>
                        {group.buttons.map((btn) => (
                          <MapCommonButton
                            key={btn.id}
                            option={btn}
                            onClick={(e) => {
                              btn.action(e.nativeEvent);
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
      </div>
    );
  }

  if (!groups.length) {
    return <ModuleContainer {...moduleContainerProps} />;
  }

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <div ref={rootRef} className="map-toolbar-control">
          <MapControlGroupButton row>
            {toolbarSplit.visible.map((group) => (
              <MapControlGroupButton key={group.id} row>
                {group.buttons.map((btn) => (
                  <MapCommonButton
                    key={btn.id}
                    option={btn}
                    onClick={(e) => btn.action(e.nativeEvent)}
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
          {overflowOpen ? (
            <div className={overflowClassFor(pos)} role="menu">
              {toolbarSplit.overflow.map((group) => (
                <MapControlGroupButton key={group.id} row>
                  {group.buttons.map((btn) => (
                    <MapCommonButton
                      key={btn.id}
                      option={btn}
                      onClick={(e) => {
                        btn.action(e.nativeEvent);
                        setMoreOpen(false);
                      }}
                    />
                  ))}
                </MapControlGroupButton>
              ))}
            </div>
          ) : null}
        </div>
      }
    />
  );
}
