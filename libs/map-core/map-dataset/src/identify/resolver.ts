import { FallbackResolver, runMapControlAction } from '@hungpvq/map-core';
import { MapMouseEvent } from 'maplibre-gl';
import {
  attributeTableIdentifyRowSelectKey,
  queueAttributeTableSelectRows,
} from '../attribute-table';
import type { IdentifyMultiResult } from '../interfaces/dataset.parts';
import { handleMenuAction } from '../menu/handle';
import { LIST_VIEW_MENU_ID } from '../menu/items';
import { closeIdentifyExclusiveUi } from './close-exclusive-ui';
import {
  countIdentifyMultiFeatures,
  getAttributeTableTarget,
  getFirstIdentifyMultiFeature,
  resolveIdentifyHitAction,
} from './hit-action';
import { groupIdentifyResults, IDENTIFY_RESULT_CONTROL } from './result';

export type IdentifyContext = {
  records: IdentifyMultiResult[];
  mapId: string;
  event?: MapMouseEvent | MouseEvent;
  total?: number;
  /**
   * True when identify is scoped to one layer (InputSelect / layer-item).
   * False / omitted = all layers → only IdentifyResult popup.
   */
  singleLayer?: boolean;
  /** Abort superseded identify before mutating the result panel. */
  signal?: AbortSignal;
  /** Forwarded on panel updates so UI can drop stale writes. */
  requestId?: number;
};

function isIdentifyContextAborted(ctx: IdentifyContext): boolean {
  return !!ctx.signal?.aborted;
}

function updateResultPanel(
  ctx: IdentifyContext,
  payload: Record<string, unknown>,
) {
  if (isIdentifyContextAborted(ctx)) return;
  runMapControlAction(
    ctx.mapId,
    IDENTIFY_RESULT_CONTROL.id,
    IDENTIFY_RESULT_CONTROL.actionUpdate,
    {
      ...payload,
      ...(ctx.requestId != null ? { requestId: ctx.requestId } : {}),
    },
  );
}

function createDefaultIdentifyResolverActions() {
  return [
    {
      when: (ctx: IdentifyContext) =>
        resolveIdentifyHitAction(ctx) === 'detail',
      prepare: ({ records }: IdentifyContext) => {
        const first = getFirstIdentifyMultiFeature(records)!;
        const menu = first.identify.getMenu(LIST_VIEW_MENU_ID.item.showDetail)!;
        return { identify: first.identify, value: first.feature.data, menu };
      },
      execute: ({
        identify,
        value,
        event,
        mapId,
        menu,
        signal,
      }: IdentifyContext & {
        identify: IdentifyMultiResult['identify'];
        value: unknown;
        menu: unknown;
      }) => {
        if (signal?.aborted) return;
        handleMenuAction(menu as never, {
          event: event as never,
          layer: identify,
          mapId,
          value,
        });
      },
    },
    {
      when: (ctx: IdentifyContext) => resolveIdentifyHitAction(ctx) === 'table',
      prepare: ({ records }: IdentifyContext) =>
        getAttributeTableTarget(records)!,
      execute: ({
        list,
        features,
        event,
        mapId,
        menu,
        signal,
      }: IdentifyContext & {
        list: { id: string };
        features: { id: string | number }[];
        menu: unknown;
      }) => {
        if (signal?.aborted) return;
        handleMenuAction(menu as never, {
          event: event as never,
          layer: list as never,
          mapId,
        });
        queueAttributeTableSelectRows(
          mapId,
          features.map((feature) =>
            attributeTableIdentifyRowSelectKey(feature),
          ),
          list.id,
        );
      },
    },
    {
      always: true as const,
      execute: (ctx: IdentifyContext) => {
        const { records, event } = ctx;
        const lngLat =
          event &&
          typeof event === 'object' &&
          'lngLat' in event &&
          event.lngLat &&
          typeof (event as MapMouseEvent).lngLat?.lng === 'number'
            ? (event as MapMouseEvent).lngLat
            : undefined;
        updateResultPanel(ctx, {
          items: groupIdentifyResults(records),
          loading: false,
          ...(lngLat
            ? {
                origin: {
                  latitude: lngLat.lat,
                  longitude: lngLat.lng,
                },
              }
            : {}),
        });
      },
    },
    {
      always: true as const,
      when: (ctx: IdentifyContext) =>
        !isIdentifyContextAborted(ctx) &&
        !!ctx.total &&
        ctx.total > 0 &&
        resolveIdentifyHitAction(ctx) === 'result',
      execute: (ctx: IdentifyContext) => {
        updateResultPanel(ctx, {
          show: true,
          loading: false,
        });
      },
    },
  ];
}

/** Build a fresh default identify UI resolver (for compose / override). */
export function createDefaultIdentifyResolver() {
  const resolver = new FallbackResolver<IdentifyContext>(
    createDefaultIdentifyResolverActions() as never,
  );
  resolver.setPrepare(({ records, mapId, signal }) => {
    if (!signal?.aborted) {
      closeIdentifyExclusiveUi(mapId);
    }
    return { total: countIdentifyMultiFeatures(records) };
  });
  return resolver;
}

export const identifyResolver = createDefaultIdentifyResolver();
