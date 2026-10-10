import type { MapSimple, WithMapPropType } from '@hungpvq/map-core';
import {
  getLegendName,
  isSupportGenLayerLegend,
  type LegendLayerSpecification,
} from '@hungpvq/map-core/legend';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { mdiMapLegend } from '@mdi/js';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { InputCheckbox } from '../../../field';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { useShow } from '../../../hooks/useShow';
import {
  ModuleContainer,
  ModuleContainerProps,
} from '../../../modules/ModuleContainer/ModuleContainer';
import { useEventListener } from '../../event/hook/useEvent';
import { useLang } from '../../lang/hook';
import { useMapControl } from '../../registry/useMapControl';
import { useLayerLegend } from '../lib/useLayerLegend';

export function LegendControl(props: WithMapPropType) {
  const merged = { ...defaultMapProps, ...props };
  const [show, setShow] = useShow(false);
  const { callMap, mapId, order } = useMap(merged);
  const { trans } = useLang(mapId);
  const { getLayerLegendNode } = useLayerLegend();
  const [onlyRender, setOnlyRender] = useState(false);
  const [legends, setLegends] = useState<{ icon: ReactNode; name: string }[]>(
    [],
  );
  const onlyRenderRef = useRef(onlyRender);
  onlyRenderRef.current = onlyRender;

  const updateLegend = useCallback(
    (map: MapSimple) => {
      if (!map) return;
      let layers: ReturnType<MapSimple['getStyle']>['layers'] = [];
      try {
        layers = map.getStyle()?.layers || [];
      } catch {
        return;
      }
      let visibleLayers: Set<string> | null = null;
      if (onlyRenderRef.current) {
        visibleLayers = new Set();
        try {
          for (const feature of map.queryRenderedFeatures()) {
            visibleLayers.add(feature.layer.id);
          }
        } catch {
          visibleLayers = null;
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
          .map((layer) => {
            try {
              return {
                icon: getLayerLegendNode(map, layer),
                name: getLegendName(layer),
              };
            } catch {
              return { icon: null, name: getLegendName(layer) };
            }
          }),
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

  const singleButton = {
    kind: 'single' as const,
    getState: () =>
      mdiButtonState(mdiMapLegend, {
        visible: true,
        active: show,
        title: trans('map.legend-control.title'),
        order,
      }),
    onClick: () => setShow(!show),
  };

  const { moduleContainerProps, panelBind, control } = useMapControl(mapId, {
    id: 'mapLegendControl',
    panelKind: 'popup',
    title: trans('map.legend-control.title'),
    from: merged,
    order,
    show,
    setShow,
    defaultPanelSize: { width: 400, height: 400 },
    actions: [{ type: 'mapLegendControl', run: () => setShow(!show) }],
    host: { button: singleButton },
    toolbar: singleButton,
  });

  useEffect(() => {
    control.sync();
  }, [show, control]);
  const renderDraggable = useCallback<
    NonNullable<ModuleContainerProps['draggable']>
  >(
    (bind) =>
      show ? (
        <DraggableItemPopup
          show={show}
          onUpdateShow={(v) => setShow(!!v)}
          title={trans('map.legend-control.title')}
          {...bind}
          {...panelBind}
        >
          <div className="map-legend-control">
            <div className="map-legend-control__list">
              {legends.map((item, i) => (
                <div
                  key={i}
                  className="map-legend-control__item"
                >
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
      ) : null,
    [legends, onlyRender, panelBind, setShow, show, trans],
  );
  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={renderDraggable}
    />
  );
}
