import { getMap } from '@hungpvq/vue-map-core';
import { GeoJSONSource } from 'maplibre-gl';
import { Ref } from 'vue';

export function createOrbitGlobalActions(mapId: Ref<string>) {
  let frameId: number | null = null;

  const startOrbit = (center: [number, number]) => {
    let angle = 0;

    getMap(mapId.value, (map) => {
      map.easeTo({
        center,
        duration: 0,
      });
    });
    const step = () => {
      getMap(mapId.value, (map) => {
        map.rotateTo(angle, { duration: 0 });
      });

      angle += 0.2; // tốc độ xoay
      frameId = requestAnimationFrame(step);
    };

    step();
  };

  const stopOrbit = () => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  return {
    orbitAround: (payload: { center: [number, number] }) => ({
      add: () => {
        getMap(mapId.value, (map) => {
          map.flyTo({ center: payload.center });
          startOrbit(payload.center);
        });
      },
      remove: () => stopOrbit(),
    }),

    orbitAroundCurrent: () => ({
      add: () => {
        getMap(mapId.value, (map) => {
          const center = map.getCenter().toArray() as [number, number];
          startOrbit(center);
        });
      },
      remove: () => stopOrbit(),
    }),
  };
}

export function createSimpleMapAction(mapId: Ref<string>) {
  return {
    drawRoute: ({
      geojson,
    }: {
      geojson:
        | GeoJSON.Feature<GeoJSON.Geometry>
        | GeoJSON.FeatureCollection<GeoJSON.Geometry>
        | string;
    }) => ({
      add: () => {
        withMapReady(mapId.value, (map) => {
          (map.getSource('route') as GeoJSONSource)?.setData(geojson);
        });
      },
      remove: () => {
        withMapReady(mapId.value, (map) => {
          (map.getSource('route') as GeoJSONSource)?.setData({
            type: 'FeatureCollection',
            features: [],
          });
        });
      },
    }),
    zoomTo: (payload: { center: [number, number]; zoom: number }) => ({
      add: () => {
        withMapReady(mapId.value, (map) => {
          map.flyTo({ center: payload.center, zoom: payload.zoom });
        });
      },
    }),
    panTo: (payload: { center: [number, number] }) => ({
      add: () => {
        withMapReady(mapId.value, (map) => {
          map.panTo(payload.center);
        });
      },
    }),
    rotateTo: ({ angle }: { angle: number }) => ({
      add: () => {
        withMapReady(mapId.value, (map) => {
          map.rotateTo(angle);
        });
      },
    }),
  };
}

export function withMapReady(
  mapId: string,
  action: (map: mapboxgl.Map) => void
) {
  getMap(mapId, (map) => {
    if (map.isStyleLoaded()) {
      action(map);
    } else {
      map.once('load', () => action(map));
    }
  });
}
