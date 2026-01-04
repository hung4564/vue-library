import { EventClick, useEventMap } from '@hungpvq/vue-map-core';
import MapboxDraw, {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawUpdateEvent,
} from '@mapbox/mapbox-gl-draw';
import { Feature } from 'geojson';
import { MapMouseEvent } from 'maplibre-gl';
import { nextTick, Ref, ref } from 'vue';
import { useConfigDrawControl } from '../../../store';
import { MapDrawOption } from '../../../types';

export function useDrawEvents(
  mapId: string,
  control: MapboxDraw,
  drawOptions: Ref<MapDrawOption | undefined>,
  callbacks: {
    onSelectMethod: (value: 'select' | 'delete') => void;
    redrawSource: () => Promise<void>;
    getContext: () => { mapId: string };
  },
) {
  const { setFeature } = useConfigDrawControl(mapId);
  const current_feature = ref<Feature | undefined>(undefined);
  const isDraw = ref(false);
  const method = ref('');

  const { add: addEventClick, remove: removeEventClick } = useEventMap(
    mapId,
    new EventClick().setHandler(onMapClick),
  );

  function onDrawCreated(event: DrawCreateEvent) {
    for (const feature of event.features) {
      setFeature('added', feature);
    }
  }

  function onDrawUpdated(event: DrawUpdateEvent) {
    for (const feature of event.features) {
      setFeature('updated', feature);
    }
  }

  function onDrawDeleted(event: DrawDeleteEvent) {
    for (const feature of event.features) {
      setFeature('deleted', feature);
    }
    nextTick(() => {
      callbacks.onSelectMethod('select');
    });
  }

  async function onMapClick(e: MapMouseEvent) {
    const action = drawOptions.value;
    if (!action) {
      return;
    }
    const feature = await (action.selectFeature &&
      action.selectFeature(
        { point: [e.lngLat.lng, e.lngLat.lat] },
        callbacks.getContext(),
      ));
    current_feature.value = feature;
    if (!feature) {
      return;
    }
    switch (method.value) {
      case 'select': {
        const feature_ids = control?.add({
          type: 'FeatureCollection',
          features: [feature],
        });

        if (feature_ids && feature_ids.length > 0) {
          isDraw.value = true;
          removeEventClick();
          control.changeMode('direct_select', {
            featureId: feature_ids[0],
          });
        }
        break;
      }

      case 'delete': {
        control?.delete(control.getSelectedIds());
        action.deleteFeature &&
          (await action.deleteFeature(feature, callbacks.getContext()));
        await callbacks.redrawSource();
        break;
      }
    }
  }

  return {
    onDrawCreated,
    onDrawUpdated,
    onDrawDeleted,
    onMapClick,
    addEventClick,
    removeEventClick,
    current_feature,
    isDraw,
    method,
  };
}
