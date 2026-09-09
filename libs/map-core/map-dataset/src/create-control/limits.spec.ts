import { describe, expect, it } from 'vitest';
import {
  CREATE_CONTROL_MAX_FILE_BYTES,
  assertCreateControlFileSize,
  formatCreateControlBytes,
} from './limits';

describe('assertCreateControlFileSize', () => {
  it('allows files under the limit', () => {
    expect(() =>
      assertCreateControlFileSize([{ size: 1024 } as File]),
    ).not.toThrow();
  });

  it('throws when total size exceeds max', () => {
    expect(() =>
      assertCreateControlFileSize([
        { size: CREATE_CONTROL_MAX_FILE_BYTES + 1 } as File,
      ]),
    ).toThrow(/File too large/);
  });
});

describe('formatCreateControlBytes', () => {
  it('formats B / KiB / MiB', () => {
    expect(formatCreateControlBytes(512)).toBe('512 B');
    expect(formatCreateControlBytes(2048)).toBe('2.0 KiB');
    expect(formatCreateControlBytes(2 * 1024 * 1024)).toBe('2.0 MiB');
  });
});
