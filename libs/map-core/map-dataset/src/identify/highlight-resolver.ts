import { createMapCoreMetaRegistry, FallbackResolver } from '@hungpvq/map-core';
import type { Feature } from 'geojson';
import { getHighlightController } from '../highlight/controller';
import type { HighlightSource } from '../highlight/types';
import type { IDataset } from '../interfaces/dataset.base';
import type { IdentifyMultiResult } from '../interfaces/dataset.parts';
import { convertItemToFeature } from '../utils/convert';

/**
 * Highlight map-FX context — same shape idea as identify UI context:
 * pass `records` (identify path) or explicit `features`/`count` (AttributeTable).
 */
export type HighlightContext = {
  mapId: string;
  /** Identify multi results (preferred for identify runs). */
  records?: IdentifyMultiResult[];
  /** Explicit features (AttributeTable / tests). Filled from `records` in prepare. */
  features?: Feature[];
  /** Filled from `features.length` in prepare when omitted. */
  count?: number;
  dataset?: IDataset;
  /** Highlight sources to clear / paint (default `['identify']` after prepare). */
  sources?: HighlightSource[];
  signal?: AbortSignal;
};

function clearSources(mapId: string, sources: HighlightSource[]) {
  const hl = getHighlightController(mapId);
  for (const source of sources) {
    hl.hideIfSource(source);
  }
}

function createDefaultHighlightResolverActions() {
  return [
    {
      when: (ctx: HighlightContext) =>
        (ctx.count ?? 0) === 1 && !!ctx.features?.[0],
      execute: async (ctx: HighlightContext) => {
        if (ctx.signal?.aborted) return;
        const feature = ctx.features![0]!;
        const sources = ctx.sources!.length ? ctx.sources! : ['identify'];
        await getHighlightController(ctx.mapId).show(feature, {
          source: sources[0]!,
          dataset: ctx.dataset,
        });
      },
    },
    {
      always: true as const,
      when: (ctx: HighlightContext) =>
        !((ctx.count ?? 0) === 1 && !!ctx.features?.[0]),
      execute: (ctx: HighlightContext) => {
        if (ctx.signal?.aborted) return;
        const sources = ctx.sources?.length ? ctx.sources : ['identify'];
        clearSources(ctx.mapId, sources);
      },
    },
  ];
}

/** Build a fresh default highlight map-FX resolver (for compose / override). */
export function createDefaultHighlightResolver() {
  const resolver = new FallbackResolver<HighlightContext>(
    createDefaultHighlightResolverActions() as never,
  );
  resolver.setPrepare((ctx) => {
    const features =
      ctx.features ?? featuresFromIdentifyRecords(ctx.records ?? []);
    return {
      features,
      count: ctx.count ?? features.length,
      dataset: ctx.dataset ?? ctx.records?.[0]?.identify,
      sources: ctx.sources?.length
        ? ctx.sources
        : (['identify'] as HighlightSource[]),
    };
  });
  return resolver;
}

export const highlightResolver = createDefaultHighlightResolver();

const highlightResolverRegistry = createMapCoreMetaRegistry<
  FallbackResolver<HighlightContext>
>({
  key: 'highlight-resolver',
  createDefault: () => highlightResolver,
});

export function getGlobalHighlightResolver(): FallbackResolver<HighlightContext> {
  return highlightResolverRegistry.getDefault();
}

export function setGlobalHighlightResolver(
  resolver: FallbackResolver<HighlightContext>,
): void {
  highlightResolverRegistry.setDefault(resolver);
}

export function setHighlightResolver(
  mapId: string,
  resolver: FallbackResolver<HighlightContext> | null,
): void {
  highlightResolverRegistry.set(mapId, resolver);
}

export function getHighlightResolver(
  mapId: string,
): FallbackResolver<HighlightContext> {
  return highlightResolverRegistry.get(mapId);
}

/** Collect GeoJSON features from identify multi results (for highlight). */
export function featuresFromIdentifyRecords(
  records: IdentifyMultiResult[],
): Feature[] {
  const out: Feature[] = [];
  for (const record of records) {
    for (const row of record.features ?? []) {
      const data = row.data;
      if (!data || typeof data !== 'object') continue;
      if (
        'type' in data &&
        (data as { type?: string }).type === 'Feature' &&
        'geometry' in data
      ) {
        out.push(data as Feature);
        continue;
      }
      if ('geometry' in data && (data as { geometry?: unknown }).geometry) {
        out.push(
          convertItemToFeature(
            data as { id?: string | number; geometry: Feature['geometry'] },
          ),
        );
      }
    }
  }
  return out;
}

/**
 * Identify path mirror of `getIdentifyResolver(mapId).execute({ records, mapId })`.
 */
export async function runHighlightFromRecords(options: {
  mapId: string;
  records: IdentifyMultiResult[];
  sources?: HighlightSource[];
  signal?: AbortSignal;
}): Promise<void> {
  await getHighlightResolver(options.mapId).execute({
    mapId: options.mapId,
    records: options.records,
    sources: options.sources,
    signal: options.signal,
  });
}
