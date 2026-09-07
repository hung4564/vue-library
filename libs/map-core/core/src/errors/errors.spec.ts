import { describe, expect, it } from 'vitest';
import {
  BasemapError,
  MapError,
  MapEventError,
  MapInitializationError,
} from './index';

describe('MapError', () => {
  it('stores code, context, recoverable, and cause stack', () => {
    const cause = new Error('root');
    const err = new MapError('failed', 'CUSTOM', {
      context: { mapId: 'm1' },
      recoverable: true,
      cause,
    });

    expect(err.name).toBe('MapError');
    expect(err.code).toBe('CUSTOM');
    expect(err.recoverable).toBe(true);
    expect(err.context).toEqual({ mapId: 'm1' });
    expect(err.cause).toBe(cause);
    expect(err.stack).toContain('Caused by:');
  });

  it('setContext merges into existing context', () => {
    const err = new MapError('x', 'C', { context: { a: 1 } });
    err.setContext({ b: 2 });
    expect(err.context).toEqual({ a: 1, b: 2 });
  });
});

describe('MapError subclasses', () => {
  it('MapInitializationError uses MAP_INIT_ERROR and is not recoverable', () => {
    const err = new MapInitializationError('init failed');
    expect(err.code).toBe('MAP_INIT_ERROR');
    expect(err.recoverable).toBe(false);
  });

  it('MapEventError uses MAP_EVENT_ERROR', () => {
    expect(new MapEventError('e').code).toBe('MAP_EVENT_ERROR');
  });

  it('BasemapError defaults recoverable true', () => {
    expect(new BasemapError('b').recoverable).toBe(true);
    expect(new BasemapError('b', { recoverable: false }).recoverable).toBe(
      false,
    );
    expect(new BasemapError('b').code).toBe('BASEMAP_ERROR');
  });
});
