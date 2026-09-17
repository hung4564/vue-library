import { EventClick } from '@hungpvq/map-core/event';
import {
  MapDraw,
  classifyDrawCreateFeature,
  ensureFeatureId,
  getDrawModeSelectEffects,
  getFeatureEditMode,
  isDraftOption,
  type DrawCreateEvent,
  type DrawDeleteEvent,
  type DrawUpdateEvent,
  type MapDrawOption,
} from '@hungpvq/map-draw';
import { useEventMap } from '@hungpvq/react-map-core';
import type { Feature } from 'geojson';
import type { MapMouseEvent } from 'maplibre-gl';
import { useCallback, useMemo, useRef, useState } from 'react';

type SetFeature = (
  type: 'added' | 'updated' | 'deleted',
  feature: Feature,
) => void;

export function useDrawEvents(
  mapId: string,
  control: MapDraw,
  drawOptions: MapDrawOption | undefined,
  setFeature: SetFeature,
) {
  const [isDraw, setIsDraw] = useState(false);
  const [method, setMethod] = useState('');
  const [currentFeature, setCurrentFeature] = useState<Feature | undefined>();

  const methodRef = useRef(method);
  methodRef.current = method;
  const drawOptionsRef = useRef(drawOptions);
  drawOptionsRef.current = drawOptions;
  const setFeatureRef = useRef(setFeature);
  setFeatureRef.current = setFeature;

  const handlersRef = useRef<{
    onDrawCreated: (e: DrawCreateEvent) => void;
    onDrawUpdated: (e: DrawUpdateEvent) => void;
    onDrawDeleted: (e: DrawDeleteEvent) => void;
  }>({
    onDrawCreated: () => undefined,
    onDrawUpdated: () => undefined,
    onDrawDeleted: () => undefined,
  });

  const onMapClick = useCallback(
    async (e: MapMouseEvent) => {
      const action = drawOptionsRef.current;
      if (!action?.selectFeature) return;
      const feature = await action.selectFeature(
        { point: [e.lngLat.lng, e.lngLat.lat] },
        { mapId },
      );
      if (!feature) {
        setCurrentFeature(undefined);
        return;
      }
      ensureFeatureId(feature);
      setCurrentFeature(feature);
      const m = methodRef.current;
      if (m === 'select') {
        setFeatureRef.current('updated', feature);
        const ids = control.add({
          type: 'FeatureCollection',
          features: [feature],
        });
        if (ids.length) {
          setIsDraw(true);
          removeEventClickRef.current();
          const edit = getFeatureEditMode(feature, ids);
          if (edit.mode === 'simple_select') {
            control.changeMode('simple_select', edit.options);
          } else {
            control.changeMode('direct_select', edit.options);
          }
        }
      } else if (m === 'delete') {
        if (feature.id != null) {
          control.delete(String(feature.id));
        }
        await action.deleteFeature?.(feature, { mapId });
        if (!isDraftOption(action)) await action.redraw?.(mapId);
      }
    },
    [control, mapId],
  );

  const clickEvent = useMemo(
    () => new EventClick().setHandler(onMapClick),
    [onMapClick],
  );
  const { add: addEventClick, remove: removeEventClick } = useEventMap(
    mapId,
    clickEvent,
  );
  const removeEventClickRef = useRef(removeEventClick);
  removeEventClickRef.current = removeEventClick;

  const onSelectMethod = useCallback(
    (value: 'select' | 'delete') => {
      removeEventClick();
      setMethod(value);
      const effects = getDrawModeSelectEffects(value);
      if (effects.attachMapClick) {
        addEventClick();
      }
      control.changeMode(effects.drawMode);
    },
    [addEventClick, control, removeEventClick],
  );

  handlersRef.current = {
    onDrawCreated(event) {
      for (const feature of event.features) {
        const kind = classifyDrawCreateFeature(methodRef.current);
        setFeatureRef.current(
          kind,
          kind === 'updated' ? ensureFeatureId(feature) : feature,
        );
      }
    },
    onDrawUpdated(event) {
      for (const feature of event.features)
        setFeatureRef.current('updated', feature);
    },
    onDrawDeleted(event) {
      for (const feature of event.features)
        setFeatureRef.current('deleted', feature);
      onSelectMethod('select');
    },
  };

  return {
    isDraw,
    setIsDraw,
    method,
    setMethod,
    currentFeature,
    setCurrentFeature,
    addEventClick,
    removeEventClick,
    handlersRef,
    onSelectMethod,
  };
}
