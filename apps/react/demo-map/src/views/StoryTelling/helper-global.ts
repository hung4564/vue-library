import { getMap } from '@hungpvq/map-core';
import { GeoJSONSource, Map } from 'maplibre-gl';
import type { MutableRefObject } from 'react';

export function createOrbitGlobalActions(mapId: MutableRefObject<string>) {
  let frameId: number | null = null;

  const startOrbit = (center: [number, number]) => {
    let angle = 0;

    getMap(mapId.current, (map) => {
      map.easeTo({
        center,
        duration: 0,
      });
    });
    const step = () => {
      getMap(mapId.current, (map) => {
        map.rotateTo(angle, { duration: 0 });
      });

      angle += 0.2;
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
    orbitAround: (payload?: { center?: [number, number] }) => ({
      add: () => {
        const center = payload?.center;
        if (!center) return;
        getMap(mapId.current, (map) => {
          map.flyTo({ center });
          startOrbit(center);
        });
      },
      remove: () => stopOrbit(),
    }),

    orbitAroundCurrent: () => ({
      add: () => {
        getMap(mapId.current, (map) => {
          const center = map.getCenter().toArray() as [number, number];
          startOrbit(center);
        });
      },
      remove: () => stopOrbit(),
    }),
  };
}

export function createSimpleMapAction(mapId: MutableRefObject<string>) {
  return {
    drawRoute: (payload?: {
      geojson?:
        | GeoJSON.Feature<GeoJSON.Geometry>
        | GeoJSON.FeatureCollection<GeoJSON.Geometry>
        | string;
    }) => ({
      add: () => {
        if (payload?.geojson == null) return;
        withMapReady(mapId.current, (map) => {
          (map.getSource('route') as GeoJSONSource)?.setData(payload.geojson!);
        });
      },
      remove: () => {
        withMapReady(mapId.current, (map) => {
          (map.getSource('route') as GeoJSONSource)?.setData({
            type: 'FeatureCollection',
            features: [],
          });
        });
      },
    }),
    zoomTo: (payload?: { center?: [number, number]; zoom?: number }) => ({
      add: () => {
        if (!payload?.center || payload.zoom == null) return;
        withMapReady(mapId.current, (map) => {
          map.flyTo({ center: payload.center!, zoom: payload.zoom! });
        });
      },
    }),
    panTo: (payload?: { center?: [number, number] }) => ({
      add: () => {
        if (!payload?.center) return;
        withMapReady(mapId.current, (map) => {
          map.panTo(payload.center!);
        });
      },
    }),
    rotateTo: (payload?: { angle?: number }) => ({
      add: () => {
        if (payload?.angle == null) return;
        withMapReady(mapId.current, (map) => {
          map.rotateTo(payload.angle!);
        });
      },
    }),
  };
}

export function withMapReady(mapId: string, action: (map: Map) => void) {
  getMap(mapId, (map) => {
    if (map.isStyleLoaded()) {
      action(map);
    } else {
      map.once('load', () => action(map));
    }
  });
}
