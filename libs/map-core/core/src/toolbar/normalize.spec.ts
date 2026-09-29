import { describe, expect, it, vi } from 'vitest';

import {
  mapToolbarOptions,
  normalizeToolbarSpec,
  withLayoutToolbarOptions,
} from './normalize';

describe('normalizeToolbarSpec', () => {
  it('flattens single', () => {
    const flat = normalizeToolbarSpec({
      id: 'home',
      getState: () => ({ title: 'Home' }),
    });
    expect(flat).toHaveLength(1);
    expect(flat[0].id).toBe('home');
    expect(flat[0].getState().title).toBe('Home');
  });

  it('flattens module with group stamp', () => {
    const flat = normalizeToolbarSpec({
      kind: 'module',
      moduleId: 'zoom',
      order: 2,
      orientation: 'row',
      buttons: [{ id: 'in', getState: () => ({ title: 'In' }) }],
    });
    expect(flat[0].id).toBe('zoom:in');
    expect(flat[0].getState()).toMatchObject({
      title: 'In',
      group: 'zoom',
      order: 2,
      orientation: 'row',
    });
  });

  it('flattens module-expandable with launcher active sync', () => {
    const flat = normalizeToolbarSpec(
      {
        kind: 'module-expandable',
        moduleId: 'theme',
        expandableButton: ({ active }) => ({ title: 'Theme', active }),
        buttons: [
          {
            id: 'dark',
            getState: () => ({ title: 'Dark' }),
            onClick: vi.fn(),
          },
        ],
      },
      { isExpanded: (id) => id === 'theme' },
    );
    expect(flat.map((b) => b.id)).toEqual(['theme:launcher', 'theme:dark']);
    expect(flat[0].getState()).toMatchObject({
      title: 'Theme',
      active: true,
      role: 'launcher',
      expandable: true,
      group: 'theme',
      closeOnOutsideClick: true,
    });
    expect(flat[1].getState()).toMatchObject({
      title: 'Dark',
      role: 'option',
      expandable: true,
    });
  });

  it('stamps closeOnOutsideClick false on expandable launcher', () => {
    const flat = normalizeToolbarSpec({
      kind: 'module-expandable',
      moduleId: 'theme',
      closeOnOutsideClick: false,
      expandableButton: () => ({ title: 'Theme' }),
      buttons: [{ id: 'dark', getState: () => ({ title: 'Dark' }) }],
    });
    expect(flat[0].getState().closeOnOutsideClick).toBe(false);
  });
});

describe('mapToolbarOptions', () => {
  it('maps state for module-expandable buttons and launcher', () => {
    const mapped = mapToolbarOptions(
      {
        kind: 'module-expandable',
        moduleId: 'theme',
        expandableButton: ({ active }) => ({ title: 'L', active }),
        buttons: [{ id: 'a', getState: () => ({ title: 'A' }) }],
      },
      (s) => ({ ...s, order: 9 }),
    );
    if (mapped.kind !== 'module-expandable') throw new Error('kind');
    expect(mapped.expandableButton({ active: false }).order).toBe(9);
    expect(mapped.buttons[0].getState().order).toBe(9);
  });
});

describe('withLayoutToolbarOptions', () => {
  it('applies layout order/visible/position and module order getter', () => {
    const opts = withLayoutToolbarOptions(
      {
        kind: 'module',
        moduleId: 'zoom',
        buttons: [
          { id: 'in', getState: () => ({ title: 'In', visible: true }) },
        ],
      },
      () => ({
        visible: true,
        order: 7,
        position: 'bottom-right' as const,
      }),
    );
    if (opts.kind !== 'module') throw new Error('kind');
    expect(opts.order).toBe(7);
    expect(opts.buttons[0].getState()).toMatchObject({
      title: 'In',
      order: 7,
      position: 'bottom-right',
      visible: true,
    });
  });
});
