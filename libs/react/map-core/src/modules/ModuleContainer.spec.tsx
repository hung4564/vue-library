import {
  moduleCornerHostId,
  moduleDraggableHostId,
} from '@hungpvq/map-core';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MapContextProvider } from '../context/MapContext';
import { ModuleContainer } from './ModuleContainer/ModuleContainer';

const MAP_ID = 'module-container-react';

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('ModuleContainer portal', () => {
  it('portals btn into the corner host and cleans up on unmount', async () => {
    const corner = document.createElement('div');
    corner.id = moduleCornerHostId('top-left', MAP_ID);
    document.body.appendChild(corner);
    const drag = document.createElement('div');
    drag.id = moduleDraggableHostId(MAP_ID);
    document.body.appendChild(drag);

    const { unmount } = render(
      <MapContextProvider
        value={{ mapId: MAP_ID, dragId: moduleDraggableHostId(MAP_ID) }}
      >
        <ModuleContainer
          mapId={MAP_ID}
          position="top-left"
          controlLayout="standalone"
          btn={<button type="button" data-testid="corner-btn">Go</button>}
        />
      </MapContextProvider>,
    );

    await waitFor(() => {
      expect(corner.querySelector('[data-testid="corner-btn"]')).toBeTruthy();
    });
    expect(() => unmount()).not.toThrow();
    expect(corner.querySelector('[data-testid="corner-btn"]')).toBeNull();
  });
});
