import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TreeItem from './TreeItem.vue';
import {
  childKeys,
  displayValue,
  getValueType,
  hasChildren,
  previewValue,
} from './tree-item';

describe('tree-item helpers', () => {
  it('identifies value types correctly', () => {
    expect(getValueType(null)).toBe('null');
    expect(getValueType(undefined)).toBe('undefined');
    expect(getValueType('hello')).toBe('string');
    expect(getValueType(123)).toBe('number');
    expect(getValueType(true)).toBe('boolean');
    expect(getValueType(() => {})).toBe('function');
    expect(getValueType([1, 2])).toBe('array');
    expect(getValueType({ a: 1 })).toBe('object');
  });

  it('determines if data has children', () => {
    expect(hasChildren(null)).toBe(false);
    expect(hasChildren(undefined)).toBe(false);
    expect(hasChildren('test')).toBe(false);
    expect(hasChildren(123)).toBe(false);
    expect(hasChildren([1])).toBe(true);
    expect(hasChildren({})).toBe(true);
  });

  it('gets child keys', () => {
    expect(childKeys(null)).toEqual([]);
    expect(childKeys({ a: 1, b: 2 })).toEqual(['a', 'b']);
    expect(childKeys([10, 20])).toEqual(['0', '1']);
  });

  it('formats display value', () => {
    expect(displayValue(null)).toBe('null');
    expect(displayValue(undefined)).toBe('undefined');
    expect(displayValue('hello')).toBe('"hello"');
    expect(displayValue(42)).toBe('42');
    expect(displayValue([1, 2, 3])).toBe('Array(3)');
    expect(displayValue({ x: 1 })).toBe('Object');
  });

  it('formats preview value', () => {
    expect(previewValue([1, 2])).toBe('[...]');
    expect(previewValue({ a: 1 })).toBe('{...}');
    expect(previewValue('str')).toBe('');
  });
});

describe('TreeItem.vue component', () => {
  it('renders primitive values', () => {
    const wrapper = mount(TreeItem, {
      props: {
        label: 'name',
        data: 'Antigravity',
      },
    });

    expect(wrapper.find('.tree-item__key').text()).toBe('name:');
    expect(wrapper.find('.tree-item__value').text()).toBe('"Antigravity"');
    expect(wrapper.find('.tree-item__value--string').exists()).toBe(true);
    expect(wrapper.find('.tree-item__toggle').text()).toBe('');
  });

  it('toggles children when expandable item is clicked', async () => {
    const wrapper = mount(TreeItem, {
      props: {
        label: 'config',
        data: { enabled: true, count: 5 },
      },
    });

    expect(wrapper.find('.tree-item__toggle').text()).toBe('▶');
    expect(wrapper.find('.tree-item__preview').text()).toBe('{...}');
    expect(wrapper.find('.tree-item__children').exists()).toBe(false);

    await wrapper.find('.tree-item__row').trigger('click');
    expect(wrapper.find('.tree-item__children').exists()).toBe(true);
    expect(wrapper.findAll('.tree-item').length).toBe(3); // root + 2 children

    await wrapper.find('.tree-item__row').trigger('click');
    expect(wrapper.find('.tree-item__children').exists()).toBe(false);
  });
});
