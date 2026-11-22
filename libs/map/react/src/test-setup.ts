/**
 * Vitest setup — mock dataset facade so public-api lock does not load MapLibre.
 */
import { vi } from 'vitest';

vi.mock('@hungpvq/react-map-dataset', () => ({
  installMapApp: vi.fn(),
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
