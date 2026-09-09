import { describe, expect, it } from 'vitest';
import {
  layerMatchesSearch,
  layerNameMatchesSearch,
  splitSearchHighlight,
} from './search';

describe('layer-control search', () => {
  it('matches case-insensitively', () => {
    expect(layerNameMatchesSearch('Cities VN', 'cities')).toBe(true);
    expect(layerNameMatchesSearch('Cities', 'roads')).toBe(false);
  });

  it('matches group names', () => {
    expect(
      layerMatchesSearch(
        { getName: () => 'Roads', group: { name: 'Transport' } },
        'trans',
      ),
    ).toBe(true);
    expect(
      layerMatchesSearch(
        { getName: () => 'Roads', group: { name: 'Transport' } },
        'water',
      ),
    ).toBe(false);
  });

  it('splits highlight segments', () => {
    expect(splitSearchHighlight('Layer ABC', 'ab')).toEqual([
      { text: 'Layer ', match: false },
      { text: 'AB', match: true },
      { text: 'C', match: false },
    ]);
  });
});
