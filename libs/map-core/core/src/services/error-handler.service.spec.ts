import { describe, expect, it, vi } from 'vitest';
import { MapError } from '../errors';
import { MapErrorHandler } from './error-handler.service';

describe('MapErrorHandler', () => {
  it('normalizes plain Error to MapError and notifies listeners', () => {
    const seen: MapError[] = [];
    const handler = new MapErrorHandler({
      isDevelopment: true,
      logError: () => undefined,
    });
    const off = handler.onError((err) => seen.push(err));

    handler.handle(new Error('boom'), { mapId: 'm1' });

    expect(seen).toHaveLength(1);
    expect(seen[0].code).toBe('UNKNOWN_ERROR');
    expect(seen[0].message).toBe('boom');
    expect(seen[0].context).toEqual({ mapId: 'm1' });
    off();
  });

  it('merges context into existing MapError', () => {
    const seen: MapError[] = [];
    const handler = new MapErrorHandler({
      isDevelopment: false,
      logToService: () => undefined,
    });
    handler.onError((err) => seen.push(err));

    const err = new MapError('x', 'C', { context: { a: 1 } });
    handler.handle(err, { b: 2 });

    expect(seen[0]).toBe(err);
    expect(seen[0].context).toEqual({ a: 1, b: 2 });
  });

  it('handleOnce ignores duplicate Error instances', () => {
    const logError = vi.fn();
    const handler = new MapErrorHandler({ isDevelopment: true, logError });
    const err = new Error('once');

    handler.handleOnce(err);
    handler.handleOnce(err);

    expect(logError).toHaveBeenCalledTimes(1);
  });

  it('uses logToService in production mode', () => {
    const logToService = vi.fn();
    const handler = new MapErrorHandler({
      isDevelopment: false,
      logToService,
    });

    handler.handle(new Error('prod'));
    expect(logToService).toHaveBeenCalledOnce();
  });
});
