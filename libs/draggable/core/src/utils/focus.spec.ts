import { afterEach, describe, expect, it, vi } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { focusFirst, getFocusableElements, trapTabKey } from './focus';

describe('focus helpers', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('getFocusableElements finds interactive nodes', () => {
    document.body.innerHTML = `
      <div id="root">
        <button id="a">A</button>
        <button disabled id="b">B</button>
        <a href="#" id="c">C</a>
        <div tabindex="-1" id="d">D</div>
      </div>
    `;
    const root = document.getElementById('root')!;
    const ids = getFocusableElements(root).map((el) => el.id);
    expect(ids).toEqual(['a', 'c']);
  });

  it('focusFirst focuses the first focusable', () => {
    document.body.innerHTML = `
      <div id="root"><button id="a">A</button><button id="b">B</button></div>
    `;
    const root = document.getElementById('root')!;
    focusFirst(root);
    expect(document.activeElement?.id).toBe('a');
  });

  it('trapTabKey cycles from last to first', () => {
    document.body.innerHTML = `
      <div id="root"><button id="a">A</button><button id="b">B</button></div>
    `;
    const root = document.getElementById('root')!;
    const b = document.getElementById('b')!;
    b.focus();
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    const prevent = vi.spyOn(event, 'preventDefault');
    expect(trapTabKey(root, event)).toBe(true);
    expect(prevent).toHaveBeenCalled();
    expect(document.activeElement?.id).toBe('a');
  });

  it('trapTabKey cycles Shift+Tab from first to last', () => {
    document.body.innerHTML = `
      <div id="root"><button id="a">A</button><button id="b">B</button></div>
    `;
    const root = document.getElementById('root')!;
    document.getElementById('a')!.focus();
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    expect(trapTabKey(root, event)).toBe(true);
    expect(document.activeElement?.id).toBe('b');
  });
});
