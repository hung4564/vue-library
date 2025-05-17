/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */

import { tryOnScopeDispose } from '@hungpvq/shared';
import { ref, shallowRef, type Ref } from 'vue';
import type { ConfigurableNavigator } from '../_configurable';
import { defaultNavigator } from '../_configurable';
import { useSupported } from '../useSupported';

export interface UseGeolocationOptions
  extends Partial<PositionOptions>,
    ConfigurableNavigator {
  immediate?: boolean;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    maximumAge = 30000,
    timeout = 27000,
    navigator = defaultNavigator,
    immediate = true,
  } = options;

  const isSupported = useSupported(
    () => navigator && 'geolocation' in navigator
  );

  const locatedAt: Ref<number | null> = ref(null);
  const error = shallowRef<GeolocationPositionError | null>(null);
  const coords: Ref<GeolocationPosition['coords']> = ref({
    accuracy: 0,
    latitude: Number.POSITIVE_INFINITY,
    longitude: Number.POSITIVE_INFINITY,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  } as GeolocationPosition['coords']);

  function updatePosition(position: GeolocationPosition) {
    locatedAt.value = position.timestamp;
    coords.value = position.coords;
    error.value = null;
  }

  let watcher: number | null = null;

  function resume(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!isSupported.value || !navigator?.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      let resolved = false;

      watcher = navigator.geolocation.watchPosition(
        (position) => {
          updatePosition(position);
          if (!resolved) {
            resolved = true;
            resolve(position);
          }
        },
        (err) => {
          error.value = err;
          if (!resolved) {
            resolved = true;
            reject(err);
          }
        },
        {
          enableHighAccuracy,
          maximumAge,
          timeout,
        }
      );
    });
  }

  if (immediate) resume();

  function pause() {
    if (watcher != null && navigator?.geolocation) {
      navigator.geolocation.clearWatch(watcher);
      watcher = null;
    }
  }

  tryOnScopeDispose(() => {
    pause();
  });

  return {
    isSupported,
    coords,
    locatedAt,
    error,
    resume,
    pause,
  };
}

export type UseGeolocationReturn = ReturnType<typeof useGeolocation>;
