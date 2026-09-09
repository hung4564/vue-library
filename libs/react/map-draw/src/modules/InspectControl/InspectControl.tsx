import { type MapSimple, type WithMapPropType } from '@hungpvq/map-core';
import { EventClick, EventMouseMove } from '@hungpvq/map-core/event';
import { type MapControlButtonUIState } from '@hungpvq/map-core/toolbar';
import {
  InspectController,
  brightColor,
  generateInspectStyle,
  renderPopup as defaultRenderPopup,
  type InspectControllerOptions,
} from '@hungpvq/map-draw';
import {
  MapControlButton,
  ModuleContainer,
  defaultMapProps,
  useEventMap,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
  useToolbarControl,
} from '@hungpvq/react-map-core';
import { mdiMap, mdiMapSearch } from '@mdi/js';
import Icon from '@mdi/react';
import type { QueryRenderedFeaturesOptions } from 'maplibre-gl';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { INSPECT_CONTROL_LOCALE } from '../../locale';

/** Same icon pair as Vue InspectControl: map when idle, map-search when inspecting. */
const INSPECT_ICONS = {
  map: mdiMap,
  inspect: mdiMapSearch,
} as const;

export type InspectControlProps = WithMapPropType & {
  showInspectDefault?: boolean;
  useInspectStyle?: boolean;
  showInspectMapPopup?: boolean;
  showInspectMapPopupOnHover?: boolean;
  showMapPopup?: boolean;
  showMapPopupOnHover?: boolean;
  blockHoverPopupOnClick?: boolean;
  buildInspectStyle?: InspectControllerOptions['buildInspectStyle'];
  backgroundColor?: string;
  assignLayerColor?: InspectControllerOptions['assignLayerColor'];
  renderPopup?: InspectControllerOptions['renderPopup'];
  selectThreshold?: number;
  queryParameters?: QueryRenderedFeaturesOptions;
};

/**
 * InspectControl — same control id and logic as Vue (`mapInspectControl`).
 * Pointer UX uses EventClick / EventMouseMove + useEventMap.
 */
export function InspectControl(props: InspectControlProps) {
  const merged = {
    ...defaultMapProps,
    showInspectDefault: false,
    useInspectStyle: true,
    showInspectMapPopup: true,
    showInspectMapPopupOnHover: false,
    showMapPopup: false,
    showMapPopupOnHover: true,
    blockHoverPopupOnClick: false,
    buildInspectStyle: generateInspectStyle,
    backgroundColor: '#fff',
    assignLayerColor: brightColor,
    renderPopup: defaultRenderPopup,
    selectThreshold: 5,
    queryParameters: {},
    ...props,
  };

  const [active, setActive] = useShow(merged.showInspectDefault);
  const iconPath = active ? INSPECT_ICONS.inspect : INSPECT_ICONS.map;
  const controlSyncRef = useRef<() => void>(() => undefined);
  const syncPointerEventsRef = useRef<() => void>(() => undefined);

  const controller = useMemo(
    () =>
      new InspectController({
        showInspectMap: merged.showInspectDefault,
        useInspectStyle: merged.useInspectStyle,
        showInspectMapPopup: merged.showInspectMapPopup,
        showInspectMapPopupOnHover: merged.showInspectMapPopupOnHover,
        showMapPopup: merged.showMapPopup,
        showMapPopupOnHover: merged.showMapPopupOnHover,
        blockHoverPopupOnClick: merged.blockHoverPopupOnClick,
        buildInspectStyle: merged.buildInspectStyle,
        backgroundColor: merged.backgroundColor,
        assignLayerColor: merged.assignLayerColor,
        renderPopup: merged.renderPopup,
        selectThreshold: merged.selectThreshold,
        queryParameters: merged.queryParameters,
        onToggle: (show) => {
          setActive(show);
          syncPointerEventsRef.current();
          controlSyncRef.current();
        },
      }),
    // Intentional: create once; options are snapshotted at mount like Vue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const clickEvent = useRef(
    new EventClick().setHandler(controller.handlePointerEvent),
  );
  const moveEvent = useRef(
    new EventMouseMove().setHandler(controller.handlePointerEvent),
  );

  const onInit = useCallback(
    (map: MapSimple) => {
      controller.attach(map);
      syncPointerEventsRef.current();
    },
    [controller],
  );
  const onDestroy = useCallback(() => {
    syncPointerEventsRef.current = () => undefined;
    controller.detach();
  }, [controller]);

  const { mapId, moduleContainerProps, order } = useMap(
    {
      ...merged,
      controlId: 'mapInspectControl',
    },
    onInit,
    onDestroy,
  );
  const { trans, setLocaleDefault } = useLang(mapId);

  const { add: addEventClick, remove: removeEventClick } = useEventMap(
    mapId,
    clickEvent.current,
    false,
    'inspect-control',
  );
  const { add: addEventMouseMove, remove: removeEventMouseMove } = useEventMap(
    mapId,
    moveEvent.current,
    false,
    'inspect-control',
  );

  syncPointerEventsRef.current = () => {
    removeEventClick();
    removeEventMouseMove();
    if (controller.needsClickEvent()) {
      addEventClick();
    }
    if (controller.needsHoverEvent()) {
      addEventMouseMove();
    }
  };

  useEffect(() => {
    return () => {
      removeEventClick();
      removeEventMouseMove();
    };
  }, [removeEventClick, removeEventMouseMove]);

  useEffect(() => {
    setLocaleDefault(INSPECT_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  const toggle = useCallback(() => {
    controller.toggle();
  }, [controller]);

  useRegisterMapControl(mapId, {
    id: 'mapInspectControl',
    panelKind: 'button',
    title: trans('map.inspect-control.button'),
    buttonPosition: merged.position,
    show: active,
    setShow: (v) => {
      controller.setShowInspectMap(v);
    },
    getProps: () => ({ position: merged.position }),
    actions: [{ type: 'mapInspectControl', run: () => toggle() }],
  });

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: 'mapInspectControl',
    getState: (): MapControlButtonUIState => ({
      visible: true,
      active,
      title: trans('map.inspect-control.button'),
      order,
      icon: { type: 'mdi', path: iconPath },
    }),
    onClick: () => toggle(),
  });

  controlSyncRef.current = () => control.sync();

  useEffect(() => {
    control.sync();
  }, [active, control]);

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <MapControlButton
          active={active}
          title={trans('map.inspect-control.button')}
          onClick={() => (state ? control.onAction() : toggle())}
        >
          <Icon path={iconPath} size={0.75} />
        </MapControlButton>
      }
    />
  );
}
