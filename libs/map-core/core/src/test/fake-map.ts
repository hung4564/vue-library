import { vi } from 'vitest';
import type { MapSimple } from '../types';

type StyleState = {
  layers: Array<{ id: string; type?: string; source?: string; [k: string]: unknown }>;
  sources: Record<string, unknown>;
};

/**
 * Thin MapLibre-like fake for unit tests (node environment).
 */
export function createFakeMap(
  overrides: Partial<MapSimple> & { style?: StyleState } = {},
): MapSimple & {
  _sources: Map<string, unknown>;
  _layers: Map<string, any>;
  _handlers: Map<string, Set<(...args: any[]) => void>>;
} {
  const sources = new Map<string, unknown>();
  const layers = new Map<string, any>();
  const handlers = new Map<string, Set<(...args: any[]) => void>>();
  const style: StyleState = overrides.style ?? { layers: [], sources: {} };

  const map = {
    id: 'fake-map',
    _sources: sources,
    _layers: layers,
    _handlers: handlers,
    getStyle: () => ({
      ...style,
      layers: [...layers.values()].length
        ? [...layers.values()]
        : style.layers,
      sources: Object.fromEntries(sources),
    }),
    getSource: (id: string) => sources.get(id),
    addSource: vi.fn((id: string, source: unknown) => {
      sources.set(id, source);
    }),
    removeSource: vi.fn((id: string) => {
      sources.delete(id);
    }),
    getLayer: (id: string) => layers.get(id),
    addLayer: vi.fn((layer: any, beforeId?: string) => {
      layers.set(layer.id, layer);
      if (beforeId) {
        // keep insertion order in Map insertion; beforeId ignored for simplicity
      }
    }),
    removeLayer: vi.fn((id: string) => {
      layers.delete(id);
    }),
    setLayoutProperty: vi.fn(),
    getZoom: vi.fn(() => 5),
    getMaxZoom: vi.fn(() => 22),
    easeTo: vi.fn(),
    once: vi.fn((event: string, cb: (...args: any[]) => void) => {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(cb);
    }),
    on: vi.fn((event: string, cb: (...args: any[]) => void) => {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(cb);
    }),
    off: vi.fn((event: string, cb: (...args: any[]) => void) => {
      handlers.get(event)?.delete(cb);
    }),
    remove: vi.fn(),
    emit(event: string, payload?: unknown) {
      handlers.get(event)?.forEach((cb) => cb(payload));
    },
    ...overrides,
  };

  return map as any;
}
