import { MapInitializer, UniversalRegistry } from '@hungpvq/map-core';
import { IDENTIFY_CONTROL } from '@hungpvq/map-dataset/identify';
import { Map as MapShell } from '@hungpvq/vue-map-core';
import { mount } from '@vue/test-utils';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import { createDatasetRegistryPlugin } from '../plugin';
import CreateControl from './CreateControl/CreateControl.vue';
import IdentifyControl from './IdentifyControl/IdentifyControl.vue';
import LayerControl from './LayerControl/LayerControl.vue';
import StyleControl from './StyleControl/style-control.vue';

beforeAll(() => {
  createDatasetRegistryPlugin().install();
});

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
    queueMicrotask(() => cb.onLoad?.(map));
    return () => undefined;
  });
});

const MAP_ID = 'ui-map-dataset';

afterEach(() => {
  UniversalRegistry.clearMap(MAP_ID);
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('LayerControl + IdentifyControl UI smoke', () => {
  it('registers controls when mounted inside Map', async () => {
    const Host = defineComponent({
      components: { MapShell, LayerControl, IdentifyControl },
      setup() {
        return { mapId: MAP_ID };
      },
      template: `
        <MapShell :map-id="mapId">
          <LayerControl />
          <IdentifyControl />
        </MapShell>
      `,
    });

    const wrapper = mount(Host, { attachTo: document.body });

    await vi.waitFor(() =>
      expect(
        UniversalRegistry.getControl('mapLayerControl', MAP_ID),
      ).toBeTruthy(),
    );
    await vi.waitFor(() =>
      expect(
        UniversalRegistry.getControl(IDENTIFY_CONTROL.id, MAP_ID),
      ).toBeTruthy(),
    );

    await nextTick();
    expect(document.getElementById(`top-left-${MAP_ID}`)).toBeTruthy();

    wrapper.unmount();
  });
});

describe('StyleControl + CreateControl UI smoke', () => {
  it('registers style and create controls when mounted inside Map', async () => {
    const stubItem = {
      id: 'stub-layer',
      type: 'geojson',
      children: [],
      getName: () => 'stub',
      getParent: () => undefined,
    };

    const Host = defineComponent({
      components: { MapShell, StyleControl, CreateControl },
      setup() {
        return { mapId: MAP_ID, stubItem, showCreate: false };
      },
      template: `
        <MapShell :map-id="mapId">
          <StyleControl :item="stubItem" />
          <CreateControl :show="showCreate" />
        </MapShell>
      `,
    });

    const wrapper = mount(Host, { attachTo: document.body });

    await vi.waitFor(() =>
      expect(
        UniversalRegistry.getControl('mapStyleControl', MAP_ID),
      ).toBeTruthy(),
    );
    await vi.waitFor(() =>
      expect(
        UniversalRegistry.getControl('mapCreateControl', MAP_ID),
      ).toBeTruthy(),
    );

    wrapper.unmount();
  });
});
