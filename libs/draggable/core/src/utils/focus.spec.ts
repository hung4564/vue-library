import { afterEach, describe, expect, it, vi } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { focusFirst, getFocusableElements, setModalSiblingsInert, trapTabKey } from './focus';

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

  it('setModalSiblingsInert toggles inert/aria-hidden on siblings', () => {
    document.body.innerHTML = `
      <div class="draggable-root">
        <div class="draggable-container" id="center"><button id="bg">bg</button></div>
        <div class="draggable-modal-layer" id="layer"></div>
      </div>
    `;
    const layer = document.getElementById('layer')!;
    const center = document.getElementById('center')!;
    setModalSiblingsInert(layer, true);
    expect(center.hasAttribute('inert')).toBe(true);
    expect(center.getAttribute('aria-hidden')).toBe('true');
    expect(layer.hasAttribute('inert')).toBe(false);

    setModalSiblingsInert(layer, false);
    expect(center.hasAttribute('inert')).toBe(false);
    expect(center.hasAttribute('aria-hidden')).toBe(false);
  });

  it('setModalSiblingsInert reference-counts nested modals', () => {
    document.body.innerHTML = `
      <div class="draggable-root">
        <div class="draggable-container" id="center"></div>
        <div class="draggable-modal-layer" id="layer"></div>
      </div>
    `;
    const layer = document.getElementById('layer')!;
    const center = document.getElementById('center')!;
    setModalSiblingsInert(layer, true);
    setModalSiblingsInert(layer, true);
    setModalSiblingsInert(layer, false);
    expect(center.hasAttribute('inert')).toBe(true);
    setModalSiblingsInert(layer, false);
    expect(center.hasAttribute('inert')).toBe(false);
  });

  it('trapTabKey ignores non-Tab keys', () => {
    document.body.innerHTML = `<div id="root" tabindex="-1"><button id="a">A</button></div>`;
    const root = document.getElementById('root')!;
    expect(
      trapTabKey(
        root,
        new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }),
      ),
    ).toBe(false);
  });

  it('trapTabKey with no focusables focuses root', () => {
    document.body.innerHTML = `<div id="root" tabindex="-1"><span>x</span></div>`;
    const root = document.getElementById('root')!;
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      cancelable: true,
    });
    const prevent = vi.spyOn(event, 'preventDefault');
    expect(trapTabKey(root, event)).toBe(true);
    expect(prevent).toHaveBeenCalled();
    expect(document.activeElement).toBe(root);
  });

  it('setModalSiblingsInert no-ops for null', () => {
    expect(() => setModalSiblingsInert(null, true)).not.toThrow();
    expect(() => setModalSiblingsInert(undefined, false)).not.toThrow();
  });

  it('focusFirst falls back to root when no focusables', () => {
    document.body.innerHTML = `<div id="root" tabindex="-1"><span>empty</span></div>`;
    const root = document.getElementById('root')!;
    focusFirst(root);
    expect(document.activeElement).toBe(root);
  });
});
