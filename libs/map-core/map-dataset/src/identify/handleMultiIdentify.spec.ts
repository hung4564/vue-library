import { describe, expect, it } from 'vitest';
import { handleMultiIdentify } from './models';

describe('handleMultiIdentify', () => {
  it('returns empty array for empty identifies', async () => {
    await expect(handleMultiIdentify([], 'map-1')).resolves.toEqual([]);
  });

  it('returns features from a single identify getFeatures', async () => {
    const identify = {
      id: 'id-1',
      getFeatures: async () => [
        { id: 'f1', name: 'Feature 1', data: { a: 1 } },
      ],
    };
    const results = await handleMultiIdentify([identify as any], 'map-1');
    expect(results).toHaveLength(1);
    expect(results[0].identify).toBe(identify);
    expect(results[0].features).toEqual([
      { id: 'f1', name: 'Feature 1', data: { a: 1 } },
    ]);
  });
});
