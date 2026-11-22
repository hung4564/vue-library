/**
 * Vitest setup — mock dataset facade so public-api lock does not load Vue SFCs.
 */
import { vi } from 'vitest';

vi.mock('@hungpvq/vue-map-dataset', () => ({
  installMapApp: vi.fn((app: unknown) => app),
  createMapAppPlugin: vi.fn(() => ({ install: vi.fn() })),
}));

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
