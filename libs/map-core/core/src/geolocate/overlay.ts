import { Marker } from 'maplibre-gl';
import type { MapSimple } from '../types';
import { accuracyCircleDiameterPx } from './viewport';

function createEl(className: string): HTMLDivElement {
  if (typeof document === 'undefined') {
    const el: {
      className: string;
      classList: { add: () => void; toggle: () => void };
      style: Record<string, string>;
      appendChild: (child: unknown) => unknown;
    } = {
      className,
      classList: {
        add() {
          return undefined;
        },
        toggle() {
          return undefined;
        },
      },
      style: {},
      appendChild(child) {
        return child;
      },
    };
    return el as unknown as HTMLDivElement;
  }
  const el = document.createElement('div');
  el.className = className;
  return el;
}

const HEADING_CLASS_NAMES = [
  'map-user-location-show-heading',
  'mapboxgl-user-location-show-heading',
  'maplibregl-user-location-show-heading',
] as const;

/**
 * User-location dot + accuracy halo + optional heading (Mapbox GeolocateControl).
 */
export class UserLocationOverlay {
  private map: MapSimple;
  private showUserLocation: boolean;
  private showAccuracyCircle: boolean;
  private showUserHeading: boolean;
  private dotMarker?: Marker;
  private circleMarker?: Marker;
  private wrapperElement?: HTMLDivElement;
  private circleElement?: HTMLDivElement;
  private accuracy = 0;
  private lastHeading: number | null = null;
  private boundOnZoom: () => void;

  constructor(
    map: MapSimple,
    options: {
      showUserLocation: boolean;
      showAccuracyCircle: boolean;
      showUserHeading: boolean;
    },
  ) {
    this.map = map;
    this.showUserLocation = options.showUserLocation;
    this.showAccuracyCircle =
      options.showUserLocation && options.showAccuracyCircle;
    this.showUserHeading = options.showUserHeading;
    this.boundOnZoom = () => this.updateCircleRadius();
  }

  setPosition(lng: number, lat: number, accuracy: number): void {
    this.accuracy = accuracy;
    const center: [number, number] = [lng, lat];

    if (this.showUserLocation) {
      if (!this.dotMarker) {
        this.wrapperElement = createEl(
          'map-user-location mapboxgl-user-location maplibregl-user-location',
        );
        this.wrapperElement.appendChild(
          createEl(
            'map-user-location-dot mapboxgl-user-location-dot maplibregl-user-location-dot',
          ),
        );
        this.wrapperElement.appendChild(
          createEl(
            'map-user-location-heading mapboxgl-user-location-heading maplibregl-user-location-heading',
          ),
        );
        this.dotMarker = new Marker({
          element: this.wrapperElement,
          anchor: 'center',
          pitchAlignment: 'map',
          rotationAlignment: 'map',
        });
      }
      this.dotMarker.setLngLat(center).addTo(this.map);
      this.applyHeading();
    }

    if (this.showAccuracyCircle && Number.isFinite(accuracy) && accuracy > 0) {
      if (!this.circleMarker) {
        this.circleElement = createEl(
          'map-user-location-accuracy-circle mapboxgl-user-location-accuracy-circle maplibregl-user-location-accuracy-circle',
        );
        this.circleMarker = new Marker({
          element: this.circleElement,
          anchor: 'center',
          pitchAlignment: 'map',
        });
        this.map.on('zoom', this.boundOnZoom);
      }
      this.circleMarker.setLngLat(center).addTo(this.map);
      this.updateCircleRadius();
    } else {
      this.circleMarker?.remove();
    }
  }

  setHeading(heading: number | null): void {
    this.lastHeading = heading;
    this.applyHeading();
  }

  updateCircleRadius(): void {
    if (!this.circleElement) return;
    const diameter = accuracyCircleDiameterPx(this.map, this.accuracy);
    this.circleElement.style.width = `${Math.max(diameter, 1)}px`;
    this.circleElement.style.height = `${Math.max(diameter, 1)}px`;
    this.circleElement.style.display = diameter > 1 ? '' : 'none';
  }

  remove(): void {
    this.map.off('zoom', this.boundOnZoom);
    this.dotMarker?.remove();
    this.circleMarker?.remove();
    this.dotMarker = undefined;
    this.circleMarker = undefined;
    this.wrapperElement = undefined;
    this.circleElement = undefined;
  }

  private applyHeading(): void {
    if (!this.showUserHeading || !this.dotMarker) return;
    const heading = this.lastHeading;
    const show = heading != null && Number.isFinite(heading);
    for (const name of HEADING_CLASS_NAMES) {
      this.wrapperElement?.classList.toggle(name, show);
      if (show) this.dotMarker.addClassName?.(name);
      else this.dotMarker.removeClassName?.(name);
    }
    this.dotMarker.setRotation(show && heading != null ? heading : 0);
  }
}
