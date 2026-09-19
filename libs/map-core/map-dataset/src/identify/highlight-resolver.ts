import { createMapCoreMetaRegistry, FallbackResolver } from '@hungpvq/map-core';
import type { Feature } from 'geojson';
import type { HighlightSource } from '../highlight/types';
import type { IDataset } from '../interfaces/dataset.base';
import type { IdentifyMultiResult } from '../interfaces/dataset.parts';
import { convertItemToFeature } from '../utils/convert';
import {
  clearHighlight,
  paintHighlight,
  paintHighlights,
  type HighlightSessionIntent,
} from './highlight-session';
import type { IdentifyResolvedHitAction } from './hit-action';

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
  /**
   * From Identify UI resolve — drives default paint intent
   * (`detail` / `table` / `result`).
   * When `detail` / `table`, that UI owns highlight; Identify only paints when it owns
   * the hit and exactly one feature matched.
   */
  hitAction?: IdentifyResolvedHitAction;
  signal?: AbortSignal;
};

function sourceAsIntent(source: HighlightSource): HighlightSessionIntent {
  if (
    source === 'detail' ||
    source === 'identify' ||
    source === 'attribute-table' ||
    source === 'hover' ||
    source === 'pointer'
  ) {
    return source;
  }
  return 'identify';
}

function isAttributeTableSource(ctx: HighlightContext): boolean {
  return (ctx.sources?.[0] ?? '') === 'attribute-table';
}

function createDefaultHighlightResolverActions() {
  return [
    // E: AttributeTable owns paint — highlight every selected feature
    {
      when: (ctx: HighlightContext) => isAttributeTableSource(ctx),
      execute: async (ctx: HighlightContext) => {
        if (ctx.signal?.aborted) return;
        const features = (ctx.features ?? []).filter((f) => !!f?.geometry);
        if (!features.length) {
          clearHighlight(ctx.mapId, 'attribute-table');
          return;
        }
        await paintHighlights(ctx.mapId, {
          intent: 'attribute-table',
          features,
          dataset: ctx.dataset,
        });
      },
    },
    // A: Identify → Detail owns paint (single displayed feature)
    {
      when: (ctx: HighlightContext) =>
        !isAttributeTableSource(ctx) &&
        ctx.hitAction === 'detail' &&
        (ctx.count ?? 0) === 1 &&
        !!ctx.features?.[0],
      execute: async (ctx: HighlightContext) => {
        if (ctx.signal?.aborted) return;
        await paintHighlight(ctx.mapId, {
          intent: 'detail',
          feature: ctx.features![0]!,
          dataset: ctx.dataset,
        });
      },
    },
    // Identify → table: Identify clears; AttributeTable will paint selection
    {
      when: (ctx: HighlightContext) =>
        !isAttributeTableSource(ctx) && ctx.hitAction === 'table',
      execute: (ctx: HighlightContext) => {
        if (ctx.signal?.aborted) return;
        clearHighlight(ctx.mapId, 'identify');
      },
    },
    // Identify owns hit: only paint when exactly one feature in the pick
    {
      when: (ctx: HighlightContext) =>
        !isAttributeTableSource(ctx) &&
        ctx.hitAction !== 'detail' &&
        ctx.hitAction !== 'table' &&
        (ctx.count ?? 0) === 1 &&
        !!ctx.features?.[0],
      execute: async (ctx: HighlightContext) => {
        if (ctx.signal?.aborted) return;
        const source = ctx.sources?.length ? ctx.sources[0]! : 'identify';
        await paintHighlight(ctx.mapId, {
          intent: sourceAsIntent(source),
          feature: ctx.features![0]!,
          dataset: ctx.dataset,
        });
      },
    },
    // Multi / empty Identify (or anything unmatched): clear those sources — no multi paint
    {
      always: true as const,
      when: (ctx: HighlightContext) =>
        !isAttributeTableSource(ctx) &&
        !(
          (ctx.hitAction === 'detail' &&
            (ctx.count ?? 0) === 1 &&
            !!ctx.features?.[0]) ||
          ctx.hitAction === 'table' ||
          (ctx.hitAction !== 'detail' &&
            ctx.hitAction !== 'table' &&
            (ctx.count ?? 0) === 1 &&
            !!ctx.features?.[0])
        ),
      execute: (ctx: HighlightContext) => {
        if (ctx.signal?.aborted) return;
        const sources = ctx.sources?.length ? ctx.sources : ['identify'];
        for (const source of sources) {
          clearHighlight(ctx.mapId, sourceAsIntent(source));
        }
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
      hitAction: ctx.hitAction,
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
  hitAction?: IdentifyResolvedHitAction;
  signal?: AbortSignal;
}): Promise<void> {
  await getHighlightResolver(options.mapId).execute({
    mapId: options.mapId,
    records: options.records,
    sources: options.sources,
    hitAction: options.hitAction,
    signal: options.signal,
  });
}
