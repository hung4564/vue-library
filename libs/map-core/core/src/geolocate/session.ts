import type { FitBoundsOptions } from 'maplibre-gl';
import { MapError } from '../errors';
import { errorHandler } from '../services/error-handler.service';
import type { MapSimple } from '../types';
import { UserLocationOverlay } from './overlay';
import {
  GEOLOCATE_DEFAULT_FIT_BOUNDS_OPTIONS,
  lngLatAccuracyBounds,
  resolveGeolocateClick,
  type GeoLocateFitBoundsOptions,
  type GeoLocateWatchState,
} from './viewport';

const GEO_PERMISSION_DENIED = 1;
const RECONNECT_MS = 2000;

export type GeoLocateUiState = {
  watchState: GeoLocateWatchState;
  active: boolean;
  locating: boolean;
  disabled: boolean;
  errorMessage: string | null;
};

export type GeoLocatePermissionStatus = {
  state: PermissionState;
  addEventListener: (type: 'change', listener: () => void) => void;
  removeEventListener: (type: 'change', listener: () => void) => void;
};

export type GeoLocatePermissions = {
  query: (desc: { name: 'geolocation' }) => Promise<GeoLocatePermissionStatus>;
};

/** Public GeolocateControl options (mapboxgl.GeolocateControl). */
export type GeoLocateControlOptions = {
  fitBoundsOptions?: GeoLocateFitBoundsOptions;
  followUserLocation?: boolean;
  geolocation?: Geolocation;
  positionOptions?: PositionOptions;
  showAccuracyCircle?: boolean;
  showUserHeading?: boolean;
  showUserLocation?: boolean;
  trackUserLocation?: boolean;
};

export type GeoLocateSessionOptions = GeoLocateControlOptions & {
  map: MapSimple;
  mapId?: string;
  permissions?: GeoLocatePermissions;
  onStateChange?: (state: GeoLocateUiState) => void;
};

const DEFAULT_POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 6000,
  maximumAge: 0,
};

/**
 * Framework-agnostic geolocate behavior aligned with mapboxgl.GeolocateControl.
 */
export class GeoLocateSession {
  private map: MapSimple;
  private mapId?: string;
  private trackUserLocation: boolean;
  private followUserLocation: boolean;
  private showAccuracyCircle: boolean;
  private showUserLocation: boolean;
  private showUserHeading: boolean;
  private fitBoundsOptions: GeoLocateFitBoundsOptions;
  private positionOptions: PositionOptions;
  private geolocation: Geolocation | undefined;
  private permissions: GeoLocatePermissions | undefined;
  private onStateChange?: (state: GeoLocateUiState) => void;

  private watchState: GeoLocateWatchState = 'OFF';
  private watchId: number | undefined;
  private overlay: UserLocationOverlay;
  private lastPosition: GeolocationPosition | undefined;
  private lastErrorMessage: string | null = null;
  private engaged = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private permissionStatus: GeoLocatePermissionStatus | undefined;
  private headingListening = false;
  private deviceHeading: number | undefined;
  private boundOnMoveStart: (event: { originalEvent?: Event }) => void;
  private boundOnPermissionChange: () => void;
  private boundOnDeviceOrientation: (event: DeviceOrientationEvent) => void;

  constructor(options: GeoLocateSessionOptions) {
    this.map = options.map;
    this.mapId = options.mapId;
    this.trackUserLocation = options.trackUserLocation ?? false;
    this.followUserLocation = options.followUserLocation ?? true;
    this.showUserLocation = options.showUserLocation ?? true;
    this.showAccuracyCircle = options.showAccuracyCircle ?? true;
    this.showUserHeading = options.showUserHeading ?? false;
    this.fitBoundsOptions = {
      ...GEOLOCATE_DEFAULT_FIT_BOUNDS_OPTIONS,
      ...options.fitBoundsOptions,
    };
    this.positionOptions = {
      ...DEFAULT_POSITION_OPTIONS,
      ...options.positionOptions,
    };
    this.geolocation = options.geolocation ?? globalThis.navigator?.geolocation;
    this.permissions =
      options.permissions ??
      (globalThis.navigator?.permissions as GeoLocatePermissions | undefined);
    this.onStateChange = options.onStateChange;
    this.overlay = new UserLocationOverlay(this.map, {
      showUserLocation: this.showUserLocation,
      showAccuracyCircle: this.showAccuracyCircle,
      showUserHeading: this.showUserHeading && this.trackUserLocation,
    });
    this.boundOnMoveStart = (event) => this.onMoveStart(event);
    this.boundOnPermissionChange = () => this.onPermissionChange();
    this.boundOnDeviceOrientation = (event) => this.onDeviceOrientation(event);
  }

  getUiState(): GeoLocateUiState {
    const errorMessage = this.lastErrorMessage;
    return {
      watchState: this.watchState,
      active:
        !errorMessage &&
        (this.watchState === 'ACTIVE_LOCK' ||
          this.watchState === 'WAITING_ACTIVE'),
      locating: this.watchState === 'WAITING_ACTIVE' && !errorMessage,
      disabled: !!errorMessage,
      errorMessage,
    };
  }

  /**
   * Call from a click/tap before `toggle()` so iOS / Chrome can prompt for
   * device-orientation permission while the user gesture is still active.
   */
  static primeDeviceOrientationPermission(): void {
    if (typeof window === 'undefined') return;
    const DeviceOrientation = window.DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<string>;
        })
      | undefined;
    if (typeof DeviceOrientation?.requestPermission === 'function') {
      void DeviceOrientation.requestPermission().catch(() => undefined);
    }
  }

  toggle(): void {
    const action = resolveGeolocateClick(
      this.watchState,
      this.trackUserLocation,
    );
    if (action === 'request-once') {
      this.engaged = true;
      this.requestOnce();
      return;
    }
    if (action === 'start-watch') {
      this.engaged = true;
      this.startWatch();
      return;
    }
    if (action === 'stop') {
      this.stop();
      return;
    }
    this.reLock();
  }

  destroy(): void {
    this.stop({ silent: true });
  }

  private requestOnce(): void {
    if (!this.geolocation) {
      this.fail(new Error('Location not available'));
      return;
    }
    this.geolocation.getCurrentPosition(
      (position) => this.onFix(position, { oneShot: true, fromClick: true }),
      (error) => this.fail(error),
      this.positionOptions,
    );
  }

  private startWatch(): void {
    this.watchState = 'WAITING_ACTIVE';
    this.emitState();
    this.beginWatch();
    this.startHeading();
  }

  private beginWatch(): void {
    if (!this.geolocation) {
      this.fail(new Error('Location not available'));
      return;
    }
    this.clearWatchOnly();
    this.map.on('movestart', this.boundOnMoveStart);
    this.watchId = this.geolocation.watchPosition(
      (position) =>
        this.onFix(position, {
          oneShot: !this.trackUserLocation,
          fromClick: this.watchState === 'WAITING_ACTIVE',
        }),
      (error) => this.fail(error),
      this.positionOptions,
    );
  }

  private onFix(
    position: GeolocationPosition,
    options: { oneShot: boolean; fromClick: boolean },
  ): void {
    const recovered = !!this.lastErrorMessage;
    this.lastPosition = position;
    this.lastErrorMessage = null;
    this.updateMarker(position);

    if (options.oneShot) {
      this.engaged = false;
      this.clearWatchOnly();
      this.map.off('movestart', this.boundOnMoveStart);
      this.watchState = 'OFF';
      this.updateCameraIfNeeded(position, {
        fromClick: options.fromClick || recovered,
      });
      this.emitState();
      return;
    }

    if (
      this.watchState === 'WAITING_ACTIVE' ||
      this.watchState === 'ACTIVE_LOCK' ||
      this.watchState === 'ACTIVE_ERROR' ||
      this.watchState === 'OFF'
    ) {
      const fromClick =
        options.fromClick ||
        recovered ||
        this.watchState === 'WAITING_ACTIVE' ||
        this.watchState === 'ACTIVE_ERROR';
      this.watchState = 'ACTIVE_LOCK';
      this.updateCameraIfNeeded(position, { fromClick });
    } else if (this.watchState === 'BACKGROUND_ERROR') {
      this.watchState = 'BACKGROUND';
    }

    this.emitState();
  }

  private reLock(): void {
    this.watchState = 'ACTIVE_LOCK';
    if (this.lastPosition) {
      this.updateCameraIfNeeded(this.lastPosition, { fromClick: true });
    }
    this.emitState();
  }

  private stop(options?: { silent?: boolean }): void {
    this.engaged = false;
    this.clearReconnectTimer();
    this.unbindPermissionListener();
    this.clearWatchOnly();
    this.map.off('movestart', this.boundOnMoveStart);
    this.stopHeading();
    this.overlay.remove();
    this.lastPosition = undefined;
    this.lastErrorMessage = null;
    this.watchState = 'OFF';
    if (!options?.silent) {
      this.emitState();
    }
  }

  private onMoveStart(event: { originalEvent?: Event }): void {
    if (!event.originalEvent) return;
    if (this.watchState === 'ACTIVE_LOCK') {
      this.watchState = 'BACKGROUND';
      this.emitState();
    }
  }

  private updateMarker(position: GeolocationPosition): void {
    this.overlay.setPosition(
      position.coords.longitude,
      position.coords.latitude,
      position.coords.accuracy,
    );
    if (this.deviceHeading != null) {
      this.overlay.setHeading(this.deviceHeading);
    } else {
      const gpsHeading = position.coords.heading;
      this.overlay.setHeading(
        gpsHeading != null && Number.isFinite(gpsHeading) ? gpsHeading : null,
      );
    }
  }

  private updateCameraIfNeeded(
    position: GeolocationPosition,
    options: { fromClick: boolean },
  ): void {
    if (!this.followUserLocation && !options.fromClick) return;
    this.updateCamera(position);
  }

  private updateCamera(position: GeolocationPosition): void {
    const { longitude, latitude, accuracy } = position.coords;
    this.map.fitBounds(
      lngLatAccuracyBounds(longitude, latitude, accuracy),
      this.fitBoundsOptions as FitBoundsOptions,
    );
  }

  private startHeading(): void {
    if (!this.showUserHeading || !this.trackUserLocation) return;
    if (typeof window === 'undefined') return;
    this.addHeadingListener();
    const DeviceOrientation = window.DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<string>;
        })
      | undefined;
    if (typeof DeviceOrientation?.requestPermission === 'function') {
      void DeviceOrientation.requestPermission()
        .then((state) => {
          if (state === 'granted') this.addHeadingListener();
        })
        .catch(() => undefined);
    }
  }

  private headingEventName(): 'deviceorientationabsolute' | 'deviceorientation' {
    return typeof window !== 'undefined' &&
      'ondeviceorientationabsolute' in window
      ? 'deviceorientationabsolute'
      : 'deviceorientation';
  }

  private addHeadingListener(): void {
    if (this.headingListening || typeof window === 'undefined') return;
    window.addEventListener(
      this.headingEventName(),
      this.boundOnDeviceOrientation as EventListener,
    );
    this.headingListening = true;
  }

  private stopHeading(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener(
      'deviceorientation',
      this.boundOnDeviceOrientation as EventListener,
    );
    window.removeEventListener(
      'deviceorientationabsolute',
      this.boundOnDeviceOrientation as EventListener,
    );
    this.headingListening = false;
    this.deviceHeading = undefined;
    this.overlay.setHeading(null);
  }

  private onDeviceOrientation(event: DeviceOrientationEvent): void {
    const webkit = (
      event as DeviceOrientationEvent & { webkitCompassHeading?: number }
    ).webkitCompassHeading;
    if (typeof webkit === 'number' && Number.isFinite(webkit)) {
      this.deviceHeading = webkit;
    } else if (event.absolute === true && event.alpha != null) {
      this.deviceHeading = event.alpha * -1;
    } else {
      return;
    }
    this.overlay.setHeading(this.deviceHeading);
  }

  private fail(error: { message?: string; code?: number } | Error): void {
    const alreadyError = !!this.lastErrorMessage;
    const code = 'code' in error ? error.code : undefined;
    const message =
      (error && 'message' in error && error.message) ||
      'Location not available';
    this.lastErrorMessage = message;
    this.lastPosition = undefined;
    this.overlay.remove();

    if (!this.trackUserLocation) {
      this.watchState = 'OFF';
    } else if (
      this.watchState === 'WAITING_ACTIVE' ||
      this.watchState === 'ACTIVE_LOCK' ||
      this.watchState === 'OFF'
    ) {
      this.watchState = 'ACTIVE_ERROR';
    } else if (this.watchState === 'BACKGROUND') {
      this.watchState = 'BACKGROUND_ERROR';
    }

    if (!alreadyError) {
      errorHandler.handle(
        new MapError(message, 'MAP_GEOLOCATE_ERROR', {
          recoverable: true,
          cause: error,
          context: { mapId: this.mapId },
        }),
      );
    }
    this.emitState();

    void this.bindPermissionListener();
    if (this.engaged && code !== GEO_PERMISSION_DENIED && this.geolocation) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer != null) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      if (!this.engaged || !this.lastErrorMessage) return;
      this.beginWatch();
    }, RECONNECT_MS);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer != null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  private async bindPermissionListener(): Promise<void> {
    if (this.permissionStatus || !this.permissions?.query) return;
    try {
      this.permissionStatus = await this.permissions.query({
        name: 'geolocation',
      });
      this.permissionStatus.addEventListener(
        'change',
        this.boundOnPermissionChange,
      );
    } catch {
      this.permissionStatus = undefined;
    }
  }

  private unbindPermissionListener(): void {
    this.permissionStatus?.removeEventListener(
      'change',
      this.boundOnPermissionChange,
    );
    this.permissionStatus = undefined;
  }

  private onPermissionChange(): void {
    const state = this.permissionStatus?.state;
    if (!this.engaged) return;
    if (state === 'granted' && this.lastErrorMessage) {
      this.clearReconnectTimer();
      this.beginWatch();
      return;
    }
    if (state === 'denied') {
      this.fail(new Error('Location not available'));
    }
  }

  private clearWatchOnly(): void {
    if (this.watchId != null && this.geolocation) {
      this.geolocation.clearWatch(this.watchId);
      this.watchId = undefined;
    }
  }

  private emitState(): void {
    this.onStateChange?.(this.getUiState());
  }
}
