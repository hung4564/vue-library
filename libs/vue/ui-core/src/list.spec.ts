import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import List from './List.vue';
import ListItem from './ListItem.vue';

describe('List.vue', () => {
  it('renders default ul element and list role', () => {
    const wrapper = mount(List, {
      slots: {
        default: '<li>Item 1</li>',
      },
    });

    expect(wrapper.element.tagName).toBe('UL');
    expect(wrapper.classes()).toContain('ui-list');
    expect(wrapper.text()).toBe('Item 1');
  });

  it('supports modifier classes: dense, divided, flush', () => {
    const wrapper = mount(List, {
      props: {
        dense: true,
        divided: true,
        flush: true,
        as: 'div',
      },
    });

    expect(wrapper.element.tagName).toBe('DIV');
    expect(wrapper.classes()).toContain('ui-list--dense');
    expect(wrapper.classes()).toContain('ui-list--divided');
    expect(wrapper.classes()).toContain('ui-list--flush');
  });
});

describe('ListItem.vue', () => {
  it('renders li with content and prefix/suffix slots', () => {
    const wrapper = mount(ListItem, {
      slots: {
        prefix: '<span class="test-prefix">P</span>',
        default: 'Main Content',
        suffix: '<span class="test-suffix">S</span>',
      },
    });

    expect(wrapper.element.tagName).toBe('LI');
    expect(wrapper.classes()).toContain('ui-list-item');
    expect(wrapper.classes()).toContain('ui-list-item--interactive');
    expect(wrapper.find('.ui-list-item__prefix').text()).toBe('P');
    expect(wrapper.find('.ui-list-item__content').text()).toBe('Main Content');
    expect(wrapper.find('.ui-list-item__suffix').text()).toBe('S');
  });

  it('supports selected state', () => {
    const wrapper = mount(ListItem, {
      props: {
        selected: true,
      },
      slots: {
        default: 'Selected Item',
      },
    });

    expect(wrapper.classes()).toContain('ui-list-item--selected');
    expect(wrapper.attributes('aria-selected')).toBe('true');
  });

  it('emits click on interactive item', async () => {
    const wrapper = mount(ListItem, {
      props: {
        interactive: true,
      },
      slots: {
        default: 'Clickable',
      },
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('does not emit click when disabled', async () => {
    const wrapper = mount(ListItem, {
      props: {
        disabled: true,
      },
      slots: {
        default: 'Disabled',
      },
    });

    expect(wrapper.classes()).toContain('ui-list-item--disabled');
    expect(wrapper.attributes('aria-disabled')).toBe('true');

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });
});
