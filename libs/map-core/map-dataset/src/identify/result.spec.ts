import { describe, expect, it } from 'vitest';
import { shouldApplyIdentifyRequest } from './result';

describe('shouldApplyIdentifyRequest', () => {
  it('applies when requestId is omitted (legacy payloads)', () => {
    expect(shouldApplyIdentifyRequest(5, undefined)).toBe(true);
  });

  it('applies the first requestId when none applied yet', () => {
    expect(shouldApplyIdentifyRequest(undefined, 1)).toBe(true);
  });

  it('applies equal or newer requestId', () => {
    expect(shouldApplyIdentifyRequest(2, 2)).toBe(true);
    expect(shouldApplyIdentifyRequest(2, 3)).toBe(true);
  });

  it('ignores stale requestId from an older run', () => {
    expect(shouldApplyIdentifyRequest(3, 2)).toBe(false);
  });
});
