/**
 * Vitest setup for map packages that import MapLibre / CJS peers at module top-level.
 * Keeps public-api, unit, and UI smoke tests runnable without WebGL.
 */
import { vi } from 'vitest';

class ResizeObserverStub {
  observe() {
    /* noop */
  }
  unobserve() {
    /* noop */
  }
  disconnect() {
    /* noop */
  }
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub);
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation(() => ({
    matches: false,
    media: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
);

vi.mock('maplibre-gl', () => {
  class Map {
    private handlers: Record<string, Set<(...args: unknown[]) => void>> = {};

    constructor() {
      queueMicrotask(() => this.emit('load'));
    }

    private emit(event: string, payload: unknown = {}) {
      const set = this.handlers[event];
      if (!set) return;
      for (const fn of [...set]) fn(payload);
    }

    on(event: string, fn: (...args: unknown[]) => void) {
      if (!this.handlers[event]) this.handlers[event] = new Set();
      this.handlers[event].add(fn);
      return this;
    }

    once(event: string, fn: (...args: unknown[]) => void) {
      const wrap = (...args: unknown[]) => {
        this.off(event, wrap);
        fn(...args);
      };
      return this.on(event, wrap);
    }

    off(event: string, fn?: (...args: unknown[]) => void) {
      if (!fn) {
        delete this.handlers[event];
        return this;
      }
      this.handlers[event]?.delete(fn);
      return this;
    }

    remove() {
      this.handlers = {};
      return undefined;
    }

    getCanvas() {
      return { toDataURL: () => '', width: 0, height: 0 };
    }

    getContainer() {
      return { clientWidth: 800, clientHeight: 600 };
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
    setRotation() {
      return this;
    }
    addClassName() {
      return this;
    }
    removeClassName() {
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
    default: {
      Map,
      Marker,
      Popup,
      NavigationControl,
      GeolocateControl,
      ScaleControl,
      AttributionControl,
    },
  };
});

vi.mock('@mdi/react', () => ({
  Icon: () => null,
  default: { Icon: () => null },
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));
