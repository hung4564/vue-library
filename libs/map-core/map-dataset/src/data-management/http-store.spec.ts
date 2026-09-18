import { describe, expect, it, vi } from 'vitest';
import { createHttpStore } from './http-store';

describe('createHttpStore', () => {
  it('lists with page/limit query and parseList', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toContain('page=2');
      expect(url).toContain('limit=5');
      return new Response(
        JSON.stringify({
          data: [{ id: 1, name: 'a', geom: { type: 'Point', coordinates: [1, 2] } }],
          meta: { total: 11, page: 2, pageSize: 5 },
        }),
        { status: 200 },
      );
    });

    const store = createHttpStore({
      baseUrl: '/api/parcels',
      geometryField: 'geom',
      fetch: fetchMock as unknown as typeof fetch,
    });

    const page = await store.list({ page: 2, pageSize: 5 });
    expect(page.total).toBe(11);
    expect(page.items[0].geometry).toEqual({
      type: 'Point',
      coordinates: [1, 2],
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('maps a legacy envelope with parseList and parseItem', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? 'GET').toUpperCase();
      // list: /api/legacy or /api/legacy?...  detail: /api/legacy/L1
      const pathOnly = url.split('?')[0].replace(/\/$/, '');
      const segments = pathOnly.split('/').filter(Boolean);
      // /api/legacy → list; /api/legacy/L1 → detail
      const isDetail = segments.length > 2;

      if (method === 'GET' && !isDetail) {
        return new Response(
          JSON.stringify({
            success: true,
            result: {
              rows: [
                {
                  parcel_id: 'L1',
                  title: 'legacy',
                  geo: { lon: 105, lat: 21 },
                },
              ],
              pagination: { current: 1, perPage: 5, count: 9 },
            },
          }),
          { status: 200 },
        );
      }
      return new Response(
        JSON.stringify({
          success: true,
          result: {
            parcel_id: 'L1',
            title: 'legacy',
            geo: { lon: 105, lat: 21 },
          },
        }),
        { status: 200 },
      );
    });

    const store = createHttpStore({
      baseUrl: '/api/legacy',
      query: { page: 'page', pageSize: 'size' },
      fetch: fetchMock as unknown as typeof fetch,
      parseList(json) {
        const body = json as {
          result: {
            rows: Array<{
              parcel_id: string;
              title: string;
              geo: { lon: number; lat: number };
            }>;
            pagination: { current: number; perPage: number; count: number };
          };
        };
        return {
          data: body.result.rows.map((row) => ({
            id: row.parcel_id,
            name: row.title,
            geometry: {
              type: 'Point',
              coordinates: [row.geo.lon, row.geo.lat],
            },
          })),
          meta: {
            total: body.result.pagination.count,
            page: body.result.pagination.current,
            pageSize: body.result.pagination.perPage,
          },
        };
      },
      parseItem(json) {
        const body = json as {
          result: {
            parcel_id: string;
            title: string;
            geo: { lon: number; lat: number };
          };
        };
        return {
          id: body.result.parcel_id,
          name: body.result.title,
          geometry: {
            type: 'Point',
            coordinates: [body.result.geo.lon, body.result.geo.lat],
          },
        };
      },
    });

    const page = await store.list({ page: 1, pageSize: 5 });
    expect(page.total).toBe(9);
    expect(page.items[0]).toMatchObject({
      id: 'L1',
      name: 'legacy',
      geometry: { type: 'Point', coordinates: [105, 21] },
    });

    const detail = await store.get('L1');
    expect(detail?.name).toBe('legacy');
  });

  it('posts create and deletes by id', async () => {
    const calls: Array<{ url: string; method?: string }> = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, method: init?.method });
      if (init?.method === 'POST') {
        return new Response(
          JSON.stringify({ id: 'n1', name: 'new' }),
          { status: 200 },
        );
      }
      return new Response(null, { status: 204 });
    });

    const store = createHttpStore({
      baseUrl: 'https://example.test/api/items',
      fetch: fetchMock as unknown as typeof fetch,
    });

    const created = await store.create({ name: 'new' });
    expect(created.id).toBe('n1');
    await store.delete('n1');
    expect(calls[0].method).toBe('POST');
    expect(calls[1].method).toBe('DELETE');
    expect(calls[1].url).toContain('/n1');
  });
});
