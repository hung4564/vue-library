import { EventClick } from '@hungpvq/map-core/event';
import {
  MapDraw,
  createDrawSession,
  type DrawSession,
  type MapDrawOption,
} from '@hungpvq/map-draw';
import { useEventMap } from '@hungpvq/react-map-core';
import type { Feature } from 'geojson';
import type { MapMouseEvent } from 'maplibre-gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SetFeature = (
  type: 'added' | 'updated' | 'deleted',
  feature: Feature,
) => void;

/**
 * Vue parity: schedule post-delete reset + optional non-draft redraw.
 */
export function useDrawEvents(
  mapId: string,
  control: MapDraw,
  drawOptions: MapDrawOption | undefined,
  setFeature: SetFeature,
  callbacks?: {
    redrawNonDraft?: () => void | Promise<void>;
  },
) {
  const [isDraw, setIsDrawState] = useState(false);
  const [method, setMethodState] = useState('');
  const [currentFeature, setCurrentFeatureState] = useState<
    Feature | undefined
  >();

  const drawOptionsRef = useRef(drawOptions);
  drawOptionsRef.current = drawOptions;
  const setFeatureRef = useRef(setFeature);
  setFeatureRef.current = setFeature;
  const redrawNonDraftRef = useRef(callbacks?.redrawNonDraft);
  redrawNonDraftRef.current = callbacks?.redrawNonDraft;

  const sessionRef = useRef<DrawSession | null>(null);
  const addEventClickRef = useRef<() => void>(() => undefined);
  const removeEventClickRef = useRef<() => void>(() => undefined);

  if (!sessionRef.current) {
    sessionRef.current = createDrawSession({
      mapId,
      control,
      getDrawOption: () => drawOptionsRef.current,
      setFeature: (...args) => setFeatureRef.current(...args),
      // Match Vue `nextTick`: defer select reset after draw.delete.
      schedule: (fn) => {
        queueMicrotask(fn);
      },
      setMapClickActive: (active) => {
        if (active) addEventClickRef.current();
        else removeEventClickRef.current();
      },
      redrawNonDraft: () => redrawNonDraftRef.current?.(),
      onStateChange: (s) => {
        setMethodState(s.method);
        setIsDrawState(s.isDraw);
        setCurrentFeatureState(s.currentFeature);
      },
    });
  }
  const session = sessionRef.current;

  const onMapClick = useCallback(
    (e: MapMouseEvent) => {
      void session.handleMapClick(e);
    },
    [session],
  );

  const clickEvent = useMemo(
    () => new EventClick().setHandler(onMapClick),
    [onMapClick],
  );
  const { add: addEventClick, remove: removeEventClick } = useEventMap(
    mapId,
    clickEvent,
  );
  addEventClickRef.current = addEventClick;
  removeEventClickRef.current = removeEventClick;

  const onSelectMethod = useCallback(
    (value: 'select' | 'delete') => {
      session.selectMethod(value);
    },
    [session],
  );

  const handlers = session.getMapDrawHandlers();
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    return () => {
      sessionRef.current?.destroy();
      sessionRef.current = null;
    };
  }, []);

  return {
    isDraw,
    setIsDraw: (value: boolean) => {
      session.setIsDraw(value);
    },
    method,
    setMethod: (value: string) => {
      session.setMethod(value);
    },
    currentFeature,
    setCurrentFeature: (feature: Feature | undefined) => {
      session.setCurrentFeature(feature);
    },
    addEventClick,
    removeEventClick,
    handlersRef,
    onSelectMethod,
    startCreate: (drawMode: string) => session.startCreate(drawMode),
    prepareSave: () => session.prepareSave(),
    finishCancel: (onCancel?: (feature: Feature | undefined) => void) =>
      session.finishCancel(onCancel),
    redrawNonDraft: () => session.redrawNonDraft(),
  };
}
