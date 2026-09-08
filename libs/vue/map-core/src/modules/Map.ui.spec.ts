import { MapInitializer, UniversalRegistry } from '@hungpvq/map-core';
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import MapShell from './Map.vue';

beforeEach(() => {
  vi.spyOn(MapInitializer, 'validateWebglSupport').mockImplementation(
    () => undefined,
  );
  vi.spyOn(MapInitializer, 'isWebglSupported').mockReturnValue(true);
  vi.spyOn(MapInitializer, 'setupMapEvents').mockImplementation((map, cb) => {
    queueMicrotask(() => cb.onLoad?.(map));
    return () => undefined;
  });
});

const MAP_ID = 'ui-map-core';

afterEach(() => {
  UniversalRegistry.clearMap(MAP_ID);
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Map UI smoke', () => {
  it('loads map shell and renders slot after drag init', async () => {
    const onLoaded = vi.fn();
    const onError = vi.fn();
    const Host = defineComponent({
      components: { MapShell },
      setup() {
        return { onLoaded, onError, mapId: MAP_ID };
      },
      template: `
        <MapShell :map-id="mapId" @map-loaded="onLoaded" @error="onError">
          <div data-testid="map-child">child</div>
        </MapShell>
      `,
    });

    const wrapper = mount(Host, { attachTo: document.body });
    await nextTick();

    if (onError.mock.calls.length) {
      throw onError.mock.calls[0][0];
    }
    if (wrapper.find('.not-support-map').exists()) {
      throw new Error('Map fell back to not-support UI');
    }

    await vi.waitFor(() => expect(onLoaded).toHaveBeenCalled(), {
      timeout: 3000,
    });
    await nextTick();
    await nextTick();

    expect(document.getElementById(`top-left-${MAP_ID}`)).toBeTruthy();
    expect(document.getElementById(`map-draggable-${MAP_ID}`)).toBeTruthy();
    await vi.waitFor(() =>
      expect(wrapper.find('[data-testid="map-child"]').exists()).toBe(true),
    );

    wrapper.unmount();
  });
});
