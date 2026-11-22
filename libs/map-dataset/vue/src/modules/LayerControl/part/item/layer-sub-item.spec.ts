import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createDatasetPartSubListViewUiComponentBuilder } from '@hungpvq/map-dataset';
import { mdiDelete } from '@mdi/js';
import LayerSubItem from './layer-sub-item.vue';

describe('LayerSubItem', () => {
  it('hides delete button by default for sub-items', () => {
    const item = createDatasetPartSubListViewUiComponentBuilder('Sub Item').build();
    const wrapper = mount(LayerSubItem, {
      props: {
        item,
        mapId: 'test-map',
      },
    });

    // Delete icon should NOT exist by default
    const deleteIcon = wrapper.find(`path[d="${mdiDelete}"]`);
    expect(deleteIcon.exists()).toBe(false);
  });

  it('shows delete button when disabled_delete is explicitly set to false', () => {
    const item = createDatasetPartSubListViewUiComponentBuilder('Sub Item')
      .configDisabledDelete(false)
      .build();
    const wrapper = mount(LayerSubItem, {
      props: {
        item,
        mapId: 'test-map',
      },
    });

    // Delete icon should exist when disabled_delete is false
    const deleteIcon = wrapper.find(`path[d="${mdiDelete}"]`);
    expect(deleteIcon.exists()).toBe(true);
  });
});

