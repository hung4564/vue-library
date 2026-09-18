import { describe, expect, it } from 'vitest';
import { exprHandler } from './util';

describe('legend util exprHandler', () => {
  const get = exprHandler({ zoom: 10 });

  it('returns paint/layout literals and defaults', () => {
    expect(
      get(
        {
          id: 'roads',
          type: 'line',
          paint: { 'line-color': '#ff0000', 'line-width': 2 },
        } as any,
        'paint',
        'line-color',
      ),
    ).toBe('#ff0000');

    expect(
      get({ id: 'roads', type: 'line', paint: {} } as any, 'paint', 'line-width'),
    ).toBeTypeOf('number');
  });

  it('returns null for unsupported props', () => {
    expect(
      get({ id: 'x', type: 'fill', paint: {} } as any, 'paint', 'unknown-prop'),
    ).toBeNull();
  });
});
