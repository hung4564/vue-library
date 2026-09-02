import { useCallback, useEffect, useRef, useState } from 'react';
import type { MapSimple, WithMapPropType } from '@hungpvq/map-core';
import {
  LEGEND_CONTROL_LOCALE,
  getLegendName,
  isSupportGenLayerLegend,
  type LegendLayerSpecification,
} from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { mdiMapLegend } from '@mdi/js';
import type { ReactNode } from 'react';
import { MapCommonButton } from '../../../components/MapCommonButton';
import { InputCheckbox } from '../../../field';
import { defaultMapProps, useMap, useShow } from '../../../hooks';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useEventListener } from '../../event';
import { useLang } from '../../lang';
import { useToolbarControl } from '../../toolbar';
import { useLayerLegend } from '../lib/useLayerLegend';

export function LegendControl(props: WithMapPropType) {
  const merged = { ...defaultMapProps, ...props };
  const [show, setShow] = useShow(false);
  const { callMap, mapId, moduleContainerProps, order } = useMap(merged);
  const { trans, setLocaleDefault } = useLang(mapId);
  const { getLayerLegendNode } = useLayerLegend();
  const [onlyRender, setOnlyRender] = useState(false);
  const [legends, setLegends] = useState<{ icon: ReactNode; name: string }[]>(
    [],
  );
  const onlyRenderRef = useRef(onlyRender);
  onlyRenderRef.current = onlyRender;

  useEffect(() => {
    setLocaleDefault(LEGEND_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  const updateLegend = useCallback(
    (map: MapSimple) => {
      const layers = map?.getStyle().layers || [];
      let visibleLayers: Set<string> | null = null;
      if (onlyRenderRef.current) {
        visibleLayers = new Set();
        for (const feature of map.queryRenderedFeatures()) {
          visibleLayers.add(feature.layer.id);
        }
      }
      setLegends(
        layers
          .slice()
          .reverse()
          .filter(
            (layer): layer is LegendLayerSpecification =>
              (!visibleLayers || visibleLayers.has(layer.id)) &&
              isSupportGenLayerLegend(layer),
          )
          .map((layer) => ({
            icon: getLayerLegendNode(map, layer),
            name: getLegendName(layer),
          })),
      );
    },
    [getLayerLegendNode],
  );

  useEventListener(mapId, 'styledata', updateLegend);
  const { add, remove } = useEventListener(
    mapId,
    'moveend',
    updateLegend,
    false,
  );

  const addMoveEndRef = useRef(add);
  const removeMoveEndRef = useRef(remove);
  const callMapRef = useRef(callMap);
  const updateLegendRef = useRef(updateLegend);
  addMoveEndRef.current = add;
  removeMoveEndRef.current = remove;
  callMapRef.current = callMap;
  updateLegendRef.current = updateLegend;

  useEffect(() => {
    if (onlyRender) {
      addMoveEndRef.current();
      callMapRef.current((map) => updateLegendRef.current(map));
    } else {
      removeMoveEndRef.current();
    }
  }, [onlyRender]);

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: 'mapLegendControl',
    getState: () => ({
      visible: true,
      title: trans('map.legend-control.title'),
      order,
      icon: { type: 'mdi' as const, path: mdiMapLegend },
    }),
    onClick: () => setShow(!show),
  });

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        state ? (
          <MapCommonButton
            option={state}
            onClick={(e) => {
              e.stopPropagation();
              control.onAction(e.nativeEvent);
            }}
          />
        ) : null
      }
      draggable={(bind) =>
        show ? (
          <DraggableItemPopup
            show={show}
            onUpdateShow={(v) => setShow(!!v)}
            title={trans('map.legend-control.title')}
            width={400}
            height={400}
            {...bind}
          >
            <div className="map-legend-control">
              <div className="map-legend-control__list">
                {legends.map((item, i) => (
                  <div key={i} className="map-legend-control__item">
                    <div className="map-legend-control__icon">{item.icon}</div>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
              <div className="map-legend-control__action">
                <InputCheckbox
                  label={trans('map.legend-control.onlyRendered')}
                  checked={onlyRender}
                  onChange={(v) => setOnlyRender(!!v)}
                />
              </div>
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}
