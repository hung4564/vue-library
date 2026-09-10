import { MapInitializer, UniversalRegistry } from '@hungpvq/map-core';
import { Map as MapShell } from '@hungpvq/vue-map-core';
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import DrawControl from './modules/DrawControl/DrawControl.vue';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  vi.spyOn(MapInitializer, 'validateWebglSupport').mockImplementation(
    () => undefined,
  );
  vi.spyOn(MapInitializer, 'isWebglSupported').mockReturnValue(true);
  vi.spyOn(MapInitializer, 'setupMapEvents').mockImplementation((map, cb) => {
    // Ensure inspect/draw callers get a style-capable map instance
    if (map && typeof (map as { getStyle?: unknown }).getStyle !== 'function') {
      Object.assign(map, {
        getStyle: () => ({ layers: [], sources: {} }),
        setStyle: () => undefined,
        hasControl: () => false,
        addControl: () => undefined,
        removeControl: () => undefined,
      });
    }
    queueMicrotask(() => cb.onLoad?.(map));
    return () => undefined;
  });
});

const MAP_ID = 'ui-vue-map-draw';

afterEach(() => {
  UniversalRegistry.clearMap(MAP_ID);
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('DrawControl UI smoke', () => {
  it('registers mapDrawDraftList when DrawControl is mounted', async () => {
    const Host = defineComponent({
      components: { MapShell, DrawControl },
      setup() {
        return { mapId: MAP_ID };
      },
      template: `
        <MapShell :map-id="mapId">
          <DrawControl />
        </MapShell>
      `,
    });

    const wrapper = mount(Host, { attachTo: document.body });

    await vi.waitFor(() =>
      expect(
        UniversalRegistry.getControl('mapDrawDraftList', MAP_ID),
      ).toBeTruthy(),
    );

    wrapper.unmount();
  });
});
