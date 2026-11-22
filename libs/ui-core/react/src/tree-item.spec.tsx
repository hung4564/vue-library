import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TreeItem } from './TreeItem';
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

describe('TreeItem React component', () => {
  it('renders primitive values', () => {
    const { container } = render(
      <TreeItem
        label="name"
        data="Antigravity"
      />
    );

    expect(container.querySelector('.tree-item__key')?.textContent).toBe('name: ');
    expect(container.querySelector('.tree-item__value')?.textContent).toBe('"Antigravity"');
    expect(container.querySelector('.tree-item__value--string')).toBeTruthy();
    expect(container.querySelector('.tree-item__toggle')?.textContent).toBe('');
  });

  it('toggles children when expandable item is clicked', () => {
    const { container } = render(
      <TreeItem
        label="config"
        data={{ enabled: true, count: 5 }}
      />
    );

    expect(container.querySelector('.tree-item__toggle')?.textContent).toBe('▶');
    expect(container.querySelector('.tree-item__preview')?.textContent).toBe('{...}');
    expect(container.querySelector('.tree-item__children')).toBeNull();

    const row = container.querySelector('.tree-item__row') as HTMLElement;
    fireEvent.click(row);

    expect(container.querySelector('.tree-item__children')).not.toBeNull();
    expect(container.querySelectorAll('.tree-item').length).toBe(3); // root + 2 children

    fireEvent.click(row);
    expect(container.querySelector('.tree-item__children')).toBeNull();
  });
});
