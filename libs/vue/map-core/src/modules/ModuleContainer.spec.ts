import {
  moduleCornerHostId,
  moduleDraggableHostId,
} from '@hungpvq/map-core';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, provide } from 'vue';
import ModuleContainer from './ModuleContainer/ModuleContainer.vue';

const MAP_ID = 'module-container-vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ModuleContainer teleport', () => {
  it('teleports btn into the corner host and cleans up on unmount', async () => {
    const corner = document.createElement('div');
    corner.id = moduleCornerHostId('top-left', MAP_ID);
    document.body.appendChild(corner);
    const drag = document.createElement('div');
    drag.id = moduleDraggableHostId(MAP_ID);
    document.body.appendChild(drag);

    const Host = defineComponent({
      components: { ModuleContainer },
      setup() {
        provide('$map.id', MAP_ID);
        provide('$map.dragId', moduleDraggableHostId(MAP_ID));
        return { mapId: MAP_ID };
      },
      template: `
        <ModuleContainer
          :map-id="mapId"
          position="top-left"
          control-layout="standalone"
        >
          <template #btn>
            <button type="button" data-testid="corner-btn">Go</button>
          </template>
        </ModuleContainer>
      `,
    });

    const wrapper = mount(Host, { attachTo: document.body });
    await vi.waitFor(() => {
      expect(corner.querySelector('[data-testid="corner-btn"]')).toBeTruthy();
    });
    expect(() => wrapper.unmount()).not.toThrow();
    expect(corner.querySelector('[data-testid="corner-btn"]')).toBeNull();
  });
});
