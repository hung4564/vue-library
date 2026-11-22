import { describe, expect, it } from 'vitest';

import { sanitizeExportFilename } from './download';

describe('sanitizeExportFilename', () => {
  it('keeps simple names', () => {
    expect(sanitizeExportFilename('Cities')).toBe('Cities');
  });

  it('replaces path-unsafe and middle-dot characters', () => {
    expect(sanitizeExportFilename('1 · Modal · local download')).toBe(
      '1 _ Modal _ local download',
    );
    expect(sanitizeExportFilename('a/b\\c:d*e?f"g<h>i|j')).toBe(
      'a_b_c_d_e_f_g_h_i_j',
    );
  });

  it('strips leading/trailing dots underscores and spaces', () => {
    expect(sanitizeExportFilename('  ..name..  ')).toBe('name');
    expect(sanitizeExportFilename('___')).toBe('layer');
    expect(sanitizeExportFilename('')).toBe('layer');
  });
});
