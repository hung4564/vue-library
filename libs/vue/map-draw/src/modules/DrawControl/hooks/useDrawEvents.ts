import { EventClick } from '@hungpvq/map-core/event';
import {
  MapDraw,
  type DrawCreateEvent,
  type DrawDeleteEvent,
  type DrawUpdateEvent,
  type MapDrawOption,
} from '@hungpvq/map-draw';
import { useEventMap } from '@hungpvq/vue-map-core';
import type { Feature } from 'geojson';
import type { MapMouseEvent } from 'maplibre-gl';
import { nextTick, type Ref, ref } from 'vue';
import { useConfigDrawControl } from '../../../store';

function ensureFeatureId(feature: Feature): Feature {
  if (feature.id == null && feature.properties?.['id'] != null) {
    feature.id = feature.properties['id'] as string | number;
  }
  return feature;
}

function useDrawEvents(
  mapId: string,
  control: MapDraw,
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
      // Selecting an existing feature for edit also fires draw.create —
      // treat that as update, not a new add.
      if (method.value === 'select') {
        setFeature('updated', ensureFeatureId(feature));
      } else {
        setFeature('added', feature);
      }
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
    if (!feature) {
      current_feature.value = undefined;
      return;
    }
    ensureFeatureId(feature);
    current_feature.value = feature;
    switch (method.value) {
      case 'select': {
        setFeature('updated', feature);
        const feature_ids = control.add({
          type: 'FeatureCollection',
          features: [feature],
        });

        if (feature_ids && feature_ids.length > 0) {
          isDraw.value = true;
          removeEventClick();
          // mapbox-gl-draw: direct_select does not support Point
          if (feature.geometry?.type === 'Point') {
            control.changeMode('simple_select', {
              featureIds: feature_ids,
            });
          } else {
            control.changeMode('direct_select', {
              featureId: feature_ids[0],
            });
          }
        }
        break;
      }

      case 'delete': {
        if (feature.id != null) {
          control.delete(String(feature.id));
        }
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

export { useDrawEvents };
