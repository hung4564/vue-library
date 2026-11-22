import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('@hungpvq/shared-log stays vanilla JS', () => {
  it('has no vue/react adapter folders', () => {
    expect(existsSync(join(process.cwd(), 'src/vue'))).toBe(false);
    expect(existsSync(join(process.cwd(), 'src/react'))).toBe(false);
  });
});
