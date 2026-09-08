/**
 * Vitest setup for vue-map-draw.
 */
import { vi } from 'vitest';

vi.stubGlobal(
  'URL',
  class {
    static createObjectURL = vi.fn(() => 'blob:mock');
    static revokeObjectURL = vi.fn();
  },
);

vi.mock('maplibre-gl', () => {
  class Map {}
  return { Map, default: { Map } };
});
