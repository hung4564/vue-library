import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LIST_VIEW_MENU_ID } from '../menu/items';
import {
  resolveAutoIdentifyHitAction,
  resolveIdentifyHitAction,
  type IdentifyHitAction,
  type IdentifyHitActionContext,
} from './hit-action';

const findSiblingOrNearestLeaf = vi.fn();

vi.mock('../model/visitors/helpers', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../model/visitors/helpers')>();
  return {
    ...actual,
    findSiblingOrNearestLeaf: (...args: unknown[]) =>
      findSiblingOrNearestLeaf(...args),
  };
});

function makeCtx(partial: {
  onSingle?: IdentifyHitAction;
  onMultiple?: IdentifyHitAction;
  hasDetail?: boolean;
  hasTable?: boolean;
  featureCount?: number;
  singleLayer?: boolean;
}): IdentifyHitActionContext {
  const featureCount = partial.featureCount ?? 1;
  const features = Array.from({ length: featureCount }, (_, i) => ({
    id: String(i + 1),
    name: `F${i + 1}`,
    data: { id: String(i + 1) },
  }));
  const list = {
    id: 'list-1',
    getMenu: (key: string) =>
      partial.hasTable && key === LIST_VIEW_MENU_ID.layer.attributeTable
        ? { id: 'attribute-table' }
        : undefined,
  };
  findSiblingOrNearestLeaf.mockReturnValue(partial.hasTable ? list : undefined);

  const identify = {
    id: 'id-1',
    getName: () => 'Layer',
    hasMenu: (key: string) =>
      !!partial.hasDetail && key === LIST_VIEW_MENU_ID.item.showDetail,
    getMenu: () => ({ id: 'show-detail' }),
    config: {
      onSingle: partial.onSingle,
      onMultiple: partial.onMultiple,
    },
  };
  return {
    records: [{ identify: identify as never, features: features as never }],
    total: featureCount,
    singleLayer: partial.singleLayer ?? true,
  };
}

describe('resolveIdentifyHitAction', () => {
  beforeEach(() => {
    findSiblingOrNearestLeaf.mockReset();
  });

  it('uses onSingle detail / table / result', () => {
    expect(
      resolveIdentifyHitAction(
        makeCtx({ onSingle: 'detail', hasDetail: true, featureCount: 1 }),
      ),
    ).toBe('detail');
    expect(
      resolveIdentifyHitAction(
        makeCtx({ onSingle: 'table', hasTable: true, featureCount: 1 }),
      ),
    ).toBe('table');
    expect(
      resolveIdentifyHitAction(
        makeCtx({ onSingle: 'result', hasDetail: true, featureCount: 1 }),
      ),
    ).toBe('result');
  });

  it('uses onMultiple detail (first feature) / table / result', () => {
    expect(
      resolveIdentifyHitAction(
        makeCtx({ onMultiple: 'detail', hasDetail: true, featureCount: 3 }),
      ),
    ).toBe('detail');
    expect(
      resolveIdentifyHitAction(
        makeCtx({ onMultiple: 'table', hasTable: true, featureCount: 3 }),
      ),
    ).toBe('table');
    expect(
      resolveIdentifyHitAction(
        makeCtx({ onMultiple: 'result', hasTable: true, featureCount: 3 }),
      ),
    ).toBe('result');
  });

  it('auto keeps legacy single detail then table', () => {
    expect(
      resolveAutoIdentifyHitAction(
        makeCtx({ hasDetail: true, featureCount: 1, singleLayer: true }),
      ),
    ).toBe('detail');
    expect(
      resolveAutoIdentifyHitAction(
        makeCtx({
          hasDetail: false,
          hasTable: true,
          featureCount: 2,
          singleLayer: true,
        }),
      ),
    ).toBe('table');
    expect(
      resolveAutoIdentifyHitAction(
        makeCtx({ hasDetail: false, hasTable: false, featureCount: 1 }),
      ),
    ).toBe('result');
  });

  it('falls back when explicit detail/table unavailable', () => {
    expect(
      resolveIdentifyHitAction(
        makeCtx({ onSingle: 'detail', hasDetail: false, hasTable: true }),
      ),
    ).toBe('table');
  });
});
