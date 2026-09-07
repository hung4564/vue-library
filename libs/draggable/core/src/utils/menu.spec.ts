/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMenuItems, handleMenuKeydown } from './menu';

describe('menu helpers', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('getMenuItems skips disabled menuitems', () => {
    document.body.innerHTML = `
      <div role="menu" id="root">
        <li role="menuitem" tabindex="-1" id="a">A</li>
        <li role="menuitem" tabindex="-1" aria-disabled="true" id="b">B</li>
        <li role="menuitem" tabindex="-1" id="c">C</li>
      </div>
    `;
    const root = document.getElementById('root');
    expect(root).toBeTruthy();
    if (!root) return;
    expect(getMenuItems(root).map((el) => el.id)).toEqual(['a', 'c']);
  });

  it('handleMenuKeydown ArrowDown cycles focus', () => {
    document.body.innerHTML = `
      <div role="menu" id="root">
        <li role="menuitem" tabindex="-1" id="a">A</li>
        <li role="menuitem" tabindex="-1" id="b">B</li>
      </div>
    `;
    const root = document.getElementById('root');
    const a = document.getElementById('a');
    expect(root && a).toBeTruthy();
    if (!root || !a) return;
    a.focus();
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    const prevent = vi.spyOn(event, 'preventDefault');
    expect(handleMenuKeydown(root, event)).toBe(true);
    expect(prevent).toHaveBeenCalled();
    expect(document.activeElement?.id).toBe('b');
  });

  it('handleMenuKeydown Home/End jump', () => {
    document.body.innerHTML = `
      <div role="menu" id="root">
        <li role="menuitem" tabindex="-1" id="a">A</li>
        <li role="menuitem" tabindex="-1" id="b">B</li>
        <li role="menuitem" tabindex="-1" id="c">C</li>
      </div>
    `;
    const root = document.getElementById('root');
    const b = document.getElementById('b');
    expect(root && b).toBeTruthy();
    if (!root || !b) return;
    b.focus();
    handleMenuKeydown(
      root,
      new KeyboardEvent('keydown', { key: 'End', cancelable: true }),
    );
    expect(document.activeElement?.id).toBe('c');
    handleMenuKeydown(
      root,
      new KeyboardEvent('keydown', { key: 'Home', cancelable: true }),
    );
    expect(document.activeElement?.id).toBe('a');
  });
});
