import { describe, expect, it } from 'vitest';
import { formatAreaText, formatDistanceText } from './utils';

describe('measurement formatters', () => {
  it('formatDistanceText switches m/km at 1 km', () => {
    expect(formatDistanceText(0.5, 'en')).toContain('m');
    expect(formatDistanceText(1.5, 'en')).toContain('km');
  });

  it('formatAreaText switches m²/km² at 1e6 m²', () => {
    expect(formatAreaText(500, 'en')).toContain('m');
    expect(formatAreaText(2_000_000, 'en')).toContain('km');
  });
});
