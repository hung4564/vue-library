import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DevtoolPanelCard from './DevtoolPanelCard.vue';
import DevtoolPanelContainer from './DevtoolPanelContainer.vue';
import DevtoolPanelSplit from './DevtoolPanelSplit.vue';
import DevtoolPanelToolbar from './DevtoolPanelToolbar.vue';

describe('Vue DevtoolPanel components', () => {
  it('renders DevtoolPanelContainer with title and default slots', () => {
    const wrapper = mount(DevtoolPanelContainer, {
      slots: {
        title: '<div class="test-title">Header</div>',
        default: '<div class="test-body">Content</div>',
      },
    });

    expect(wrapper.classes()).toContain('devtool-panel');
    expect(wrapper.find('.test-title').exists()).toBe(true);
    expect(wrapper.find('.devtool-panel__body').exists()).toBe(true);
    expect(wrapper.find('.test-body').text()).toBe('Content');
  });

  it('renders DevtoolPanelToolbar with title and actions slots', () => {
    const wrapper = mount(DevtoolPanelToolbar, {
      slots: {
        title: 'Title Text',
        actions: '<button>Action</button>',
      },
    });

    expect(wrapper.classes()).toContain('devtool-panel__toolbar');
    expect(wrapper.find('.devtool-panel__title').text()).toBe('Title Text');
    expect(wrapper.find('.devtool-panel__actions button').text()).toBe('Action');
  });

  it('renders DevtoolPanelCard with modifiers and default slot', () => {
    const wrapper = mount(DevtoolPanelCard, {
      props: { flush: true },
      slots: {
        default: '<span>Card Content</span>',
      },
    });

    expect(wrapper.classes()).toContain('devtool-panel__card');
    expect(wrapper.classes()).toContain('devtool-panel__card--flush');
    expect(wrapper.text()).toBe('Card Content');
  });

  it('renders DevtoolPanelSplit', () => {
    const wrapper = mount(DevtoolPanelSplit, {
      slots: {
        default: '<div>Left</div><div>Right</div>',
      },
    });

    expect(wrapper.classes()).toContain('devtool-panel__split');
    expect(wrapper.findAll('.devtool-panel__split > div')).toHaveLength(2);
  });
});
