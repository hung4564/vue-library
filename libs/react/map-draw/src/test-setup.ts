/**
 * Vitest setup for react-map-draw UI smoke (MapLibre / ResizeObserver stubs).
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

vi.stubGlobal(
  'URL',
  class {
    static createObjectURL = vi.fn(() => 'blob:mock');
    static revokeObjectURL = vi.fn();
  },
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

    addControl() {
      return undefined;
    }

    removeControl() {
      return undefined;
    }

    hasControl() {
      return false;
    }

    getStyle() {
      return { layers: [], sources: {} };
    }

    setStyle() {
      return undefined;
    }

    resize() {
      return undefined;
    }
  }

  class Popup {
    setLngLat() {
      return this;
    }
    setHTML() {
      return this;
    }
    setDOMContent() {
      return this;
    }
    addTo() {
      return this;
    }
    remove() {
      return undefined;
    }
    on() {
      return this;
    }
    off() {
      return this;
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

  return {
    Map,
    Popup,
    Marker,
    default: { Map, Popup, Marker },
  };
});

vi.mock('@mdi/react', () => ({
  default: () => null,
  Icon: () => null,
}));
