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

  it('handleMenuKeydown ArrowUp cycles focus', () => {
    document.body.innerHTML = `
      <div role="menu" id="root">
        <li role="menuitem" tabindex="-1" id="a">A</li>
        <li role="menuitem" tabindex="-1" id="b">B</li>
      </div>
    `;
    const root = document.getElementById('root')!;
    document.getElementById('a')!.focus();
    handleMenuKeydown(
      root,
      new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true }),
    );
    expect(document.activeElement?.id).toBe('b');
  });

  it('handleMenuKeydown Enter/Space activate focused item', () => {
    document.body.innerHTML = `
      <div role="menu" id="root">
        <li role="menuitem" tabindex="-1" id="a">A</li>
      </div>
    `;
    const root = document.getElementById('root')!;
    const a = document.getElementById('a')!;
    const onClick = vi.fn();
    a.addEventListener('click', onClick);
    a.focus();
    expect(
      handleMenuKeydown(
        root,
        new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }),
      ),
    ).toBe(true);
    expect(onClick).toHaveBeenCalled();
    onClick.mockClear();
    expect(
      handleMenuKeydown(
        root,
        new KeyboardEvent('keydown', { key: ' ', cancelable: true }),
      ),
    ).toBe(true);
    expect(onClick).toHaveBeenCalled();
  });

  it('handleMenuKeydown returns false for empty menu or unknown key', () => {
    document.body.innerHTML = `<div role="menu" id="root"></div>`;
    const root = document.getElementById('root')!;
    expect(
      handleMenuKeydown(
        root,
        new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }),
      ),
    ).toBe(false);

    document.body.innerHTML = `
      <div role="menu" id="root2">
        <li role="menuitem" tabindex="-1" id="a">A</li>
      </div>
    `;
    const root2 = document.getElementById('root2')!;
    document.getElementById('a')!.focus();
    expect(
      handleMenuKeydown(
        root2,
        new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }),
      ),
    ).toBe(false);
  });
});
