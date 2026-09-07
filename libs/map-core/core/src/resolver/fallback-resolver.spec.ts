import { describe, expect, it, vi } from 'vitest';
import { FallbackResolver } from './fallback-resolver';

describe('FallbackResolver', () => {
  it('runs global prepare then highest-priority matching action', async () => {
    const executed: string[] = [];
    const resolver = new FallbackResolver<{ n: number; total?: number }>([
      {
        priority: 1,
        when: (ctx) => ctx.n > 0,
        execute: async () => {
          executed.push('low');
        },
      },
      {
        priority: 10,
        when: (ctx) => ctx.n > 0,
        execute: async () => {
          executed.push('high');
        },
      },
    ]).setPrepare(({ n }) => ({ total: n + 1 }));

    const result = await resolver.execute({ n: 2 });

    expect(result.success).toBe(true);
    expect(result.context.total).toBe(3);
    expect(executed).toEqual(['high']);
  });

  it('continues with always actions after exclusive success', async () => {
    const executed: string[] = [];
    const resolver = new FallbackResolver<Record<string, never>>([
      {
        execute: async () => {
          executed.push('exclusive');
        },
      },
      {
        always: true,
        execute: async () => {
          executed.push('always');
        },
      },
    ]);

    const result = await resolver.execute({});
    expect(result.success).toBe(true);
    expect(executed).toEqual(['exclusive', 'always']);
  });

  it('calls fallback when no action matches', async () => {
    const fallback = vi.fn();
    const resolver = new FallbackResolver<{ ok: boolean }>([
      {
        when: () => false,
        execute: async () => undefined,
      },
    ]).setFallback(fallback);

    const result = await resolver.execute({ ok: false });
    expect(result.success).toBe(false);
    expect(fallback).toHaveBeenCalledWith({ ok: false });
  });

  it('records errors and continues by default', async () => {
    const onError = vi.fn();
    const resolver = new FallbackResolver<Record<string, never>>([
      {
        priority: 2,
        execute: async () => {
          throw new Error('fail');
        },
      },
      {
        priority: 1,
        execute: async () => undefined,
      },
    ]);

    const result = await resolver.execute({}, { onError });
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(1);
    expect(onError).toHaveBeenCalledOnce();
  });

  it('rethrows when continueOnError is false', async () => {
    const resolver = new FallbackResolver<Record<string, never>>([
      {
        execute: async () => {
          throw new Error('stop');
        },
      },
    ]);

    await expect(
      resolver.execute({}, { continueOnError: false }),
    ).rejects.toThrow('stop');
  });
});
