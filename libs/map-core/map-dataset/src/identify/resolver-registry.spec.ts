import { beforeEach, describe, expect, it } from 'vitest';
import {
  getGlobalIdentifyResolver,
  getIdentifyResolver,
  setGlobalIdentifyResolver,
  setIdentifyResolver,
} from './resolver-registry';
import {
  createDefaultIdentifyResolver,
  identifyResolver,
} from './resolver';

describe('identify resolver registry', () => {
  beforeEach(() => {
    setGlobalIdentifyResolver(identifyResolver);
    setIdentifyResolver('m1', null);
  });

  it('falls back to global', () => {
    expect(getIdentifyResolver('m1')).toBe(getGlobalIdentifyResolver());
    expect(getGlobalIdentifyResolver()).toBe(identifyResolver);
  });

  it('uses per-map override on map:core[mapId].resolver', () => {
    const custom = createDefaultIdentifyResolver();
    setIdentifyResolver('m1', custom);
    expect(getIdentifyResolver('m1')).toBe(custom);
    expect(getIdentifyResolver('m2')).toBe(identifyResolver);
    setIdentifyResolver('m1', null);
    expect(getIdentifyResolver('m1')).toBe(identifyResolver);
  });
});
