import type { WithMapPropType } from '@hungpvq/map-core';
import {
  brightColor,
  generateColoredLayers,
  generateInspectStyle,
  getSourcesFromMap,
  isInspectStyle,
  markInspectStyle,
  type InspectStyleSpecification,
} from '@hungpvq/map-draw';
import {
  MapControlButton,
  ModuleContainer,
  defaultMapProps,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
  useToolbarControl,
} from '@hungpvq/react-map-core';
import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import type { StyleSpecification } from 'maplibre-gl';
import { useCallback, useEffect, useRef } from 'react';
import { INSPECT_CONTROL_LOCALE } from '../../locale';

export type InspectControlProps = WithMapPropType;

/**
 * Thin React InspectControl — same control id as Vue (`mapInspectControl`).
 * Full popup HTML parity remains Vue-first; this toggles inspect style layers.
 */
export function InspectControl(props: InspectControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const originalStyleRef = useRef<StyleSpecification | null>(null);
  const [active, setActive] = useShow(false);
  const { mapId, moduleContainerProps, callMap, order } = useMap({
    ...merged,
    controlId: 'mapInspectControl',
  });
  const { trans, setLocaleDefault } = useLang(mapId);

  useEffect(() => {
    setLocaleDefault(INSPECT_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  const toggle = useCallback(() => {
    callMap((map) => {
      const style = map.getStyle() as InspectStyleSpecification;
      if (isInspectStyle(style)) {
        if (originalStyleRef.current) {
          map.setStyle(originalStyleRef.current);
        }
        setActive(false);
        return;
      }
      originalStyleRef.current = structuredClone(style);
      const sources = getSourcesFromMap(map);
      const colored = generateColoredLayers(sources, brightColor);
      const next = markInspectStyle(
        generateInspectStyle(style, colored, { backgroundColor: '#fff' }),
      );
      map.setStyle(next);
      setActive(true);
    });
  }, [callMap, setActive]);

  useRegisterMapControl(mapId, {
    id: 'mapInspectControl',
    panelKind: 'button',
    title: trans('map.inspect-control.button'),
    buttonPosition: merged.position,
    show: active,
    setShow: (v) => setActive(v),
    getProps: () => ({ position: merged.position }),
    actions: [{ type: 'mapInspectControl', run: () => toggle() }],
  });

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: 'mapInspectControl',
    getState: () => ({
      visible: true,
      active,
      title: trans('map.inspect-control.button'),
      order,
      icon: { type: 'mdi' as const, path: mdiMagnify },
    }),
    onClick: () => toggle(),
  });

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
          <Icon path={mdiMagnify} size={0.75} />
        </MapControlButton>
      }
    />
  );
}
