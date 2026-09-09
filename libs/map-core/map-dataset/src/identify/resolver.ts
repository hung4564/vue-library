import { FallbackResolver, runMapControlAction } from '@hungpvq/map-core';
import { MapMouseEvent } from 'maplibre-gl';
import { IdentifyMultiResult } from '../interfaces';
import type { IListViewUI } from '../model/list';
import { findSiblingOrNearestLeaf } from '../model/visitors';
import { isListView } from '../utils';
import { queueAttributeTableSelectRows } from '../extra/attribute-table';
import { handleMenuAction, LIST_VIEW_MENU_ID } from '../menu';
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
  /**
   * When true, skip auto show-detail / attribute-table and always use
   * IdentifyResult popup (menus on items still work when opened from the panel).
   */
  preferResultControl?: boolean;
};

function countIdentifyMultiFeatures(results: IdentifyMultiResult[]): number {
  let total = 0;
  for (const result of results) {
    total += result.features?.length ?? 0;
  }
  return total;
}

function getFirstIdentifyMultiFeature(results: IdentifyMultiResult[]) {
  for (const result of results) {
    const feature = result.features?.[0];
    if (feature) {
      return { identify: result.identify, feature };
    }
  }
  return undefined;
}

function getAttributeTableTarget(records: IdentifyMultiResult[]) {
  const first = records[0];
  if (!first) return undefined;
  const list = findSiblingOrNearestLeaf<IListViewUI>(
    first.identify,
    isListView,
  );
  if (!list) return undefined;
  const menu = list.getMenu(LIST_VIEW_MENU_ID.layer.attributeTable);
  if (!menu) return undefined;
  return { list, features: first.features, menu };
}

function prefersResultPanel(ctx: IdentifyContext): boolean {
  if (ctx.preferResultControl) return true;
  return ctx.records.some(
    (record) => !!record.identify.config?.preferResultControl,
  );
}

export const identifyResolver = new FallbackResolver<IdentifyContext>([
  {
    when: (ctx) => {
      const { total, records, singleLayer } = ctx;
      if (prefersResultPanel(ctx) || !singleLayer || total !== 1) return false;
      const first = getFirstIdentifyMultiFeature(records);
      return !!first?.identify.hasMenu(LIST_VIEW_MENU_ID.item.showDetail);
    },
    prepare: ({ records }) => {
      const first = getFirstIdentifyMultiFeature(records)!;
      const menu = first.identify.getMenu(LIST_VIEW_MENU_ID.item.showDetail)!;
      return { identify: first.identify, value: first.feature.data, menu };
    },
    execute: ({ identify, value, event, mapId, menu }) => {
      handleMenuAction(menu, {
        event: event as never,
        layer: identify,
        mapId,
        value,
      });
    },
  },
  {
    when: (ctx) => {
      const { total, records, singleLayer } = ctx;
      return (
        !prefersResultPanel(ctx) &&
        !!singleLayer &&
        records.length === 1 &&
        !!total &&
        !!getAttributeTableTarget(records)
      );
    },
    prepare: ({ records }) => getAttributeTableTarget(records)!,
    execute: ({ list, features, event, mapId, menu }) => {
      handleMenuAction(menu, {
        event: event as never,
        layer: list,
        mapId,
      });
      queueAttributeTableSelectRows(
        mapId,
        features.map((feature: { id: string | number }) => String(feature.id)),
      );
    },
  },
  {
    always: true,
    execute: ({ mapId, records }) => {
      runMapControlAction(
        mapId,
        IDENTIFY_RESULT_CONTROL.id,
        IDENTIFY_RESULT_CONTROL.actionUpdate,
        {
          // Empty records clear stale items from a previous identify.
          items: groupIdentifyResults(records),
          loading: false,
        },
      );
    },
  },
  {
    when: ({ total }) => !!total && total > 0,
    execute: ({ mapId }) => {
      runMapControlAction(
        mapId,
        IDENTIFY_RESULT_CONTROL.id,
        IDENTIFY_RESULT_CONTROL.actionUpdate,
        {
          show: true,
          loading: false,
        },
      );
    },
  },
]);

identifyResolver.setPrepare(({ records }) => ({
  total: countIdentifyMultiFeatures(records),
}));
