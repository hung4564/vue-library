/**
 * Vitest setup for map packages that import MapLibre / CJS peers at module top-level.
 * Keeps public-api and unit tests runnable without WebGL.
 */
import { vi } from 'vitest';

vi.mock('maplibre-gl', () => {
  class Map {
    on() {
      return this;
    }
    off() {
      return this;
    }
    remove() {
      return undefined;
    }
    getCanvas() {
      return { toDataURL: () => '', width: 0, height: 0 };
    }
    getContainer() {
      return { clientWidth: 0, clientHeight: 0 };
    }
    project() {
      return { x: 0, y: 0 };
    }
    unproject() {
      return { lng: 0, lat: 0 };
    }
    getBounds() {
      return {
        toArray: () => [
          [0, 0],
          [0, 0],
        ],
      };
    }
    getZoom() {
      return 0;
    }
    getCenter() {
      return { lng: 0, lat: 0 };
    }
    getBearing() {
      return 0;
    }
    getPitch() {
      return 0;
    }
    getStyle() {
      return { layers: [], sources: {} };
    }
    setStyle() {
      return undefined;
    }
    addControl() {
      return undefined;
    }
    removeControl() {
      return undefined;
    }
    resize() {
      return undefined;
    }
  }
  class Marker {
    setLngLat() {
      return this;
    }
    addTo() {
      return this;
    }
    remove() {
      return undefined;
    }
  }
  class NavigationControl {}
  class GeolocateControl {}
  class ScaleControl {}
  class AttributionControl {}
  class Popup {
    setLngLat() {
      return this;
    }
    setHTML() {
      return this;
    }
    addTo() {
      return this;
    }
    remove() {
      return undefined;
    }
  }
  return {
    Map,
    Marker,
    Popup,
    NavigationControl,
    GeolocateControl,
    ScaleControl,
    AttributionControl,
    default: { Map, Marker, Popup },
  };
});

vi.mock('@mdi/react', () => ({
  Icon: () => null,
  default: { Icon: () => null },
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));
