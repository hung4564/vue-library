import { describe, expect, it, vi } from 'vitest';

import type { MapSimple } from '../types';
import { UserLocationOverlay } from './overlay';
import { GeoLocateSession } from './session';
import {
  GEOLOCATE_DEFAULT_MAX_ZOOM,
  lngLatAccuracyBounds,
  resolveGeolocateClick,
} from './viewport';

function createFakeMap() {
  const handlers: Record<string, Set<(payload?: unknown) => void>> = {};
  return {
    id: 'map-1',
    on(event: string, fn: (payload?: unknown) => void) {
      if (!handlers[event]) handlers[event] = new Set();
      handlers[event].add(fn);
      return this;
    },
    off(event: string, fn: (payload?: unknown) => void) {
      handlers[event]?.delete(fn);
      return this;
    },
    emit(event: string, payload?: unknown) {
      handlers[event]?.forEach((fn) => fn(payload));
    },
    fitBounds: vi.fn(),
    getContainer() {
      return {
        clientHeight: 400,
        getBoundingClientRect: () => ({ height: 400 }),
      };
    },
    unproject() {
      return { lng: 0, lat: 0, distanceTo: () => 2 };
    },
  };
}

function fakePosition(
  lng = 106.7,
  lat = 10.8,
  accuracy = 25,
  heading: number | null = null,
): GeolocationPosition {
  return {
    timestamp: Date.now(),
    coords: {
      longitude: lng,
      latitude: lat,
      accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading,
      speed: null,
    },
  } as GeolocationPosition;
}

describe('resolveGeolocateClick', () => {
  it('one-shots when trackUserLocation is false', () => {
    expect(resolveGeolocateClick('OFF', false)).toBe('request-once');
    expect(resolveGeolocateClick('ACTIVE_LOCK', false)).toBe('request-once');
  });

  it('matches mapbox trackUserLocation toggle', () => {
    expect(resolveGeolocateClick('OFF', true)).toBe('start-watch');
    expect(resolveGeolocateClick('WAITING_ACTIVE', true)).toBe('stop');
    expect(resolveGeolocateClick('ACTIVE_LOCK', true)).toBe('stop');
    expect(resolveGeolocateClick('ACTIVE_ERROR', true)).toBe('stop');
    expect(resolveGeolocateClick('BACKGROUND', true)).toBe('re-lock');
    expect(resolveGeolocateClick('BACKGROUND_ERROR', true)).toBe('re-lock');
  });
});

describe('lngLatAccuracyBounds', () => {
  it('returns a box around the point', () => {
    const bounds = lngLatAccuracyBounds(0, 0, 100);
    expect(bounds[0][0]).toBeLessThan(0);
    expect(bounds[1][0]).toBeGreaterThan(0);
    expect(GEOLOCATE_DEFAULT_MAX_ZOOM).toBe(15);
  });
});

describe('GeoLocateSession', () => {
  it('fits camera, then background on user pan, then re-locks', () => {
    const map = createFakeMap();
    let watchCb: ((pos: GeolocationPosition) => void) | undefined;
    const geolocation = {
      watchPosition(success: (pos: GeolocationPosition) => void) {
        watchCb = success;
        return 7;
      },
      clearWatch: vi.fn(),
      getCurrentPosition: vi.fn(),
    };

    const states: string[] = [];
    const session = new GeoLocateSession({
      map: map as unknown as MapSimple,
      geolocation: geolocation as unknown as Geolocation,
      trackUserLocation: true,
      onStateChange: (s) => states.push(s.watchState),
    });

    session.toggle();
    expect(states.at(-1)).toBe('WAITING_ACTIVE');
    watchCb?.(fakePosition());
    expect(states.at(-1)).toBe('ACTIVE_LOCK');
    expect(map.fitBounds).toHaveBeenCalled();

    map.emit('movestart', { originalEvent: {} });
    expect(states.at(-1)).toBe('BACKGROUND');

    const calls = map.fitBounds.mock.calls.length;
    session.toggle();
    expect(states.at(-1)).toBe('ACTIVE_LOCK');
    expect(map.fitBounds.mock.calls.length).toBeGreaterThan(calls);

    session.toggle();
    expect(states.at(-1)).toBe('OFF');
    expect(geolocation.clearWatch).toHaveBeenCalledWith(7);

    session.destroy();
  });

  it('reports error when geolocation is missing', () => {
    const map = createFakeMap();
    const session = new GeoLocateSession({
      map: map as unknown as MapSimple,
      geolocation: undefined,
    });
    session.toggle();
    expect(session.getUiState().watchState).toBe('OFF');
    expect(session.getUiState().errorMessage).toBeTruthy();
    expect(session.getUiState().disabled).toBe(false);
    session.destroy();
  });

  it('removes the location overlay when geolocation errors after a fix', () => {
    const map = createFakeMap();
    let errorCb: ((err: GeolocationPositionError) => void) | undefined;
    let watchCb: ((pos: GeolocationPosition) => void) | undefined;
    const geolocation = {
      watchPosition(
        success: (pos: GeolocationPosition) => void,
        error: (err: GeolocationPositionError) => void,
      ) {
        watchCb = success;
        errorCb = error;
        return 3;
      },
      clearWatch: vi.fn(),
      getCurrentPosition: vi.fn(),
    };
    const removeSpy = vi.spyOn(UserLocationOverlay.prototype, 'remove');
    const session = new GeoLocateSession({
      map: map as unknown as MapSimple,
      geolocation: geolocation as unknown as Geolocation,
      trackUserLocation: true,
    });

    session.toggle();
    watchCb?.(fakePosition());
    errorCb?.({
      code: 3,
      message: 'Timeout',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);

    expect(session.getUiState().watchState).toBe('ACTIVE_ERROR');
    expect(session.getUiState().errorMessage).toBe(
      'Location request timed out',
    );
    expect(session.getUiState().disabled).toBe(false);
    expect(session.getUiState().errorCode).toBe(3);
    expect(removeSpy).toHaveBeenCalled();
    removeSpy.mockRestore();
    session.destroy();
  });

  it('does not move the camera on watch updates when followUserLocation is false', () => {
    const map = createFakeMap();
    let watchCb: ((pos: GeolocationPosition) => void) | undefined;
    const geolocation = {
      watchPosition(success: (pos: GeolocationPosition) => void) {
        watchCb = success;
        return 1;
      },
      clearWatch: vi.fn(),
      getCurrentPosition: vi.fn(),
    };
    const session = new GeoLocateSession({
      map: map as unknown as MapSimple,
      geolocation: geolocation as unknown as Geolocation,
      trackUserLocation: true,
      followUserLocation: false,
      fitBoundsOptions: { maxZoom: 12, duration: 0 },
    });

    session.toggle();
    watchCb?.(fakePosition());
    expect(map.fitBounds).toHaveBeenCalledTimes(1);
    expect(map.fitBounds.mock.calls[0][1]).toMatchObject({
      maxZoom: 12,
      duration: 0,
    });
    watchCb?.(fakePosition(106.71, 10.81));
    expect(map.fitBounds).toHaveBeenCalledTimes(1);
    session.destroy();
  });

  it('uses GPS heading when showUserHeading is on', () => {
    const map = createFakeMap();
    let watchCb: ((pos: GeolocationPosition) => void) | undefined;
    const geolocation = {
      watchPosition(success: (pos: GeolocationPosition) => void) {
        watchCb = success;
        return 1;
      },
      clearWatch: vi.fn(),
      getCurrentPosition: vi.fn(),
    };
    const headingSpy = vi.spyOn(UserLocationOverlay.prototype, 'setHeading');
    const session = new GeoLocateSession({
      map: map as unknown as MapSimple,
      geolocation: geolocation as unknown as Geolocation,
      trackUserLocation: true,
      showUserHeading: true,
    });
    session.toggle();
    watchCb?.(fakePosition(106.7, 10.8, 25, 45));
    expect(headingSpy).toHaveBeenCalledWith(45);
    headingSpy.mockRestore();
    session.destroy();
  });

  it('one-shots then returns to OFF', () => {
    const map = createFakeMap();
    let successCb: ((pos: GeolocationPosition) => void) | undefined;
    const geolocation = {
      getCurrentPosition(success: (pos: GeolocationPosition) => void) {
        successCb = success;
      },
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };
    const onGeolocate = vi.fn();
    const session = new GeoLocateSession({
      map: map as unknown as MapSimple,
      geolocation: geolocation as unknown as Geolocation,
      trackUserLocation: false,
      onGeolocate,
    });

    session.toggle();
    expect(session.getUiState().locating).toBe(true);
    expect(session.getUiState().watchState).toBe('WAITING_ACTIVE');
    successCb?.(fakePosition());
    expect(onGeolocate).toHaveBeenCalled();
    expect(session.getUiState().watchState).toBe('OFF');
    expect(session.getUiState().locating).toBe(false);
    session.destroy();
  });

  it('keeps the button enabled after soft error so the user can stop', () => {
    const map = createFakeMap();
    let errorCb: ((err: GeolocationPositionError) => void) | undefined;
    const geolocation = {
      watchPosition(
        _success: (pos: GeolocationPosition) => void,
        error: (err: GeolocationPositionError) => void,
      ) {
        errorCb = error;
        return 9;
      },
      clearWatch: vi.fn(),
      getCurrentPosition: vi.fn(),
    };
    const onError = vi.fn();
    const onTrackEnd = vi.fn();
    const session = new GeoLocateSession({
      map: map as unknown as MapSimple,
      geolocation: geolocation as unknown as Geolocation,
      trackUserLocation: true,
      onError,
      onTrackUserLocationEnd: onTrackEnd,
    });

    session.toggle();
    errorCb?.({
      code: 3,
      message: 'Timeout',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);

    expect(session.getUiState().disabled).toBe(false);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 3 }));
    session.toggle();
    expect(session.getUiState().watchState).toBe('OFF');
    expect(onTrackEnd).toHaveBeenCalled();
    expect(geolocation.clearWatch).toHaveBeenCalledWith(9);
    session.destroy();
  });

  it('disables only on permission deny and reconnects when permission is granted', async () => {
    const map = createFakeMap();
    let watchSuccess: ((pos: GeolocationPosition) => void) | undefined;
    let watchError: ((err: GeolocationPositionError) => void) | undefined;
    let watchCalls = 0;
    const geolocation = {
      watchPosition(
        success: (pos: GeolocationPosition) => void,
        error: (err: GeolocationPositionError) => void,
      ) {
        watchCalls += 1;
        watchSuccess = success;
        watchError = error;
        return watchCalls;
      },
      clearWatch: vi.fn(),
      getCurrentPosition: vi.fn(),
    };

    let permissionState: PermissionState = 'denied';
    const listeners = new Set<() => void>();
    const permissions = {
      query: async () => ({
        get state() {
          return permissionState;
        },
        addEventListener: (_type: 'change', listener: () => void) => {
          listeners.add(listener);
        },
        removeEventListener: (_type: 'change', listener: () => void) => {
          listeners.delete(listener);
        },
      }),
    };

    const onTrackStart = vi.fn();
    const session = new GeoLocateSession({
      map: map as unknown as MapSimple,
      geolocation: geolocation as unknown as Geolocation,
      permissions: permissions as never,
      trackUserLocation: true,
      onTrackUserLocationStart: onTrackStart,
    });

    session.toggle();
    expect(onTrackStart).toHaveBeenCalled();
    watchError?.({
      code: 1,
      message: 'denied',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);

    expect(session.getUiState().disabled).toBe(true);
    expect(session.getUiState().errorCode).toBe(1);

    await Promise.resolve();
    permissionState = 'granted';
    listeners.forEach((fn) => fn());
    expect(watchCalls).toBe(2);
    watchSuccess?.(fakePosition());
    expect(session.getUiState().watchState).toBe('ACTIVE_LOCK');
    expect(session.getUiState().errorMessage).toBeNull();
    session.destroy();
  });

  it('exposes BACKGROUND ui flags while tracking unlocked', () => {
    const map = createFakeMap();
    let watchCb: ((pos: GeolocationPosition) => void) | undefined;
    const geolocation = {
      watchPosition(success: (pos: GeolocationPosition) => void) {
        watchCb = success;
        return 2;
      },
      clearWatch: vi.fn(),
      getCurrentPosition: vi.fn(),
    };
    const session = new GeoLocateSession({
      map: map as unknown as MapSimple,
      geolocation: geolocation as unknown as Geolocation,
      trackUserLocation: true,
    });

    session.toggle();
    watchCb?.(fakePosition());
    map.emit('movestart', { originalEvent: {} });
    const ui = session.getUiState();
    expect(ui.watchState).toBe('BACKGROUND');
    expect(ui.background).toBe(true);
    expect(ui.active).toBe(true);
    expect(ui.locating).toBe(false);
    session.destroy();
  });
});
