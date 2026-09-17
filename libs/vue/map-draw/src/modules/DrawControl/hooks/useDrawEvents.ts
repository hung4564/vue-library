import { EventClick } from '@hungpvq/map-core/event';
import {
  MapDraw,
  createDrawSession,
  type DrawSession,
  type MapDrawOption,
} from '@hungpvq/map-draw';
import { useEventMap } from '@hungpvq/vue-map-core';
import type { Feature } from 'geojson';
import { nextTick, onBeforeUnmount, type Ref, ref } from 'vue';
import { useConfigDrawControl } from '../../../store';

function useDrawEvents(
  mapId: string,
  control: MapDraw,
  drawOptions: Ref<MapDrawOption | undefined>,
  callbacks: {
    redrawSource: () => Promise<void>;
  },
) {
  const { setFeature } = useConfigDrawControl(mapId);
  const current_feature = ref<Feature | undefined>(undefined);
  const isDraw = ref(false);
  const method = ref('');

  const sessionHolder: { current: DrawSession | null } = { current: null };

  const { add: addEventClick, remove: removeEventClick } = useEventMap(
    mapId,
    new EventClick().setHandler((e) => {
      void sessionHolder.current?.handleMapClick(e);
    }),
  );

  const session = createDrawSession({
    mapId,
    control,
    getDrawOption: () => drawOptions.value,
    setFeature,
    schedule: (fn) => {
      void nextTick(fn);
    },
    setMapClickActive: (active) => {
      if (active) addEventClick();
      else removeEventClick();
    },
    redrawNonDraft: () => callbacks.redrawSource(),
    onStateChange: (s) => {
      method.value = s.method;
      isDraw.value = s.isDraw;
      current_feature.value = s.currentFeature;
    },
  });
  sessionHolder.current = session;

  // After delete, session schedules selectMethod via its own schedule.
  const handlers = session.getMapDrawHandlers();

  onBeforeUnmount(() => {
    session.destroy();
  });

  return {
    onDrawCreated: handlers.onDrawCreated,
    onDrawUpdated: handlers.onDrawUpdated,
    onDrawDeleted: handlers.onDrawDeleted,
    onMapClick: (e: Parameters<typeof session.handleMapClick>[0]) =>
      session.handleMapClick(e),
    addEventClick,
    removeEventClick,
    current_feature,
    isDraw,
    method,
    selectMethod: (value: 'select' | 'delete') => session.selectMethod(value),
    startCreate: (drawMode: string) => session.startCreate(drawMode),
    prepareSave: () => session.prepareSave(),
    finishCancel: (onCancel?: (feature: Feature | undefined) => void) =>
      session.finishCancel(onCancel),
    redrawNonDraft: () => session.redrawNonDraft(),
    destroy: () => session.destroy(),
  };
}

export { useDrawEvents };
