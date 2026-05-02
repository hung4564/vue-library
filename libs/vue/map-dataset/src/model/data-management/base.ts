import { getUUIDv4 } from '@hungpvq/shared';
import { createDatasetLeaf } from '../dataset.base.function';
import type {
  HookAfterHandler,
  HookBeforeHandler,
  HookPayload,
  ID,
  IDataAdapter,
  IDataDraftManagerHook,
  IDataManagementView,
  IDataManagerAfterHook,
  IDataManagerBeforeHook,
  IDataManagerHook,
  IDataManagerProps,
  IDataMapper,
  Identifiable,
  IDraftDataManagementView,
  IDraftRecord,
  IHookContext,
} from './types';
export function originMapper(): IDataMapper<any, any> {
  return {
    toExternal(feature) {
      if (!feature) {
        return;
      }
      feature.id = feature.id || feature.properties?.id;
      return feature;
    },

    fromExternal(record) {
      if (!record) {
        return;
      }
      record.id = record.id || record.properties?.id;
      return record;
    },
    toFeature(feature) {
      return feature;
    },

    toItem(record) {
      return record;
    },
  };
}
export function createDatasetPartDataManagementComponent<
  T extends Identifiable = Identifiable,
  Hooks extends IDataManagerHook<any> = IDataManagerHook<T>,
  Adapter extends IDataAdapter<any> = IDataAdapter<T>,
>(
  name: string,
  props: IDataManagerProps<T, Hooks, Adapter>,
): IDataManagementView<T> {
  const base = createDatasetLeaf(name);
  const { adapter, hooks, mapper = originMapper() } = props;
  function createHookContext<Action extends string>(
    action: Action,
    payload?: HookPayload<T, Action>,
    result?: any,
  ): IHookContext<T, Action> {
    return { adapter, action, payload, result, mapper };
  }

  async function handleWithHooks<
    Action extends string,
    Payload extends HookPayload<T, Action> = HookPayload<T, Action>,
    Return = Payload extends Partial<T> ? T : Payload,
  >(
    action: Action,
    payload: Payload,
    hookPrefix: string,
    executor: (payload: Payload) => Promise<Return> | Return,
  ): Promise<Return | void> {
    const beforeKey = `before${hookPrefix}` as keyof IDataManagerBeforeHook<T>;
    const afterKey = `after${hookPrefix}` as keyof IDataManagerAfterHook<T>;

    const beforeResult = await runBeforeHandlers<T, Action>(
      hooks as IDataDraftManagerHook<T> | undefined,
      beforeKey,
      createHookContext(action, payload),
    );

    if (beforeResult === false) return;
    if (beforeResult && 'cancel' in beforeResult && beforeResult.cancel) {
      if ('returnValue' in beforeResult) return beforeResult.returnValue;
      return;
    }
    let newPayload = beforeResult;
    if (newPayload == null) {
      newPayload = payload;
    }
    // Execute adapter action
    const result = await executor(newPayload as Payload);

    await runAfterHandlers<T, Action>(
      hooks as IDataDraftManagerHook<T> | undefined,
      afterKey,
      createHookContext(action, payload, result),
    );

    return result;
  }
  return {
    ...base,
    mapper,
    adapter,
    async handWithFeature(feature, cb) {
      const props = mapper.toItem(feature);
      const result = await cb(props);
      return mapper.toFeature(result);
    },
    async cancel(item?: Partial<T>) {
      return handleWithHooks('Cancel', item as any, 'Cancel', async (p) => p);
    },
    get type(): string {
      return 'data-management';
    },
    list: (params?: any) =>
      adapter.list(params).then((items) => items.map(mapper.toExternal)),

    create(item: Partial<T>) {
      return handleWithHooks('create', item, 'Create', (p) =>
        adapter.create(mapper.fromExternal(p)).then(mapper.toExternal),
      );
    },

    update(item: Partial<T>) {
      return handleWithHooks('update', item, 'Update', (p) =>
        adapter.update(mapper.fromExternal(p)).then(mapper.toExternal),
      );
    },

    async delete(item: Partial<T>) {
      return handleWithHooks('delete', item, 'Delete', (p) =>
        adapter.delete(mapper.fromExternal(p)).then(mapper.toExternal),
      );
    },
    async getDetail(item: Partial<T>) {
      return handleWithHooks('getDetail', item, 'GetDetail', (p) =>
        adapter.getDetail(mapper.fromExternal(p)).then(mapper.toExternal),
      ) as Promise<T | undefined>;
    },
    handleWithHooks,
    async redraw(mapId: string) {
      throw new Error('Method not implemented.');
    },
  };
}

export function createDatasetPartDataManagementDraftComponent<
  T extends Identifiable = Identifiable,
>(
  name: string,
  props: IDataManagerProps<T, IDataDraftManagerHook<T>>,
): IDraftDataManagementView<T> {
  const base = createDatasetPartDataManagementComponent<T>(name, props);
  let items: IDraftRecord<T>[] = [];

  function findDraft(id: ID) {
    return items.find((d) => d.id === id);
  }

  return {
    ...base,
    async cancel(item?: Partial<T>) {
      await base.handleWithHooks(
        'Cancel',
        item as any,
        'Cancel',
        async (p) => p,
      );
    },
    getDraftItems() {
      return items;
    },
    async create(_item: Partial<T>) {
      await base.handleWithHooks('DraftCreate', _item, 'DraftCreate', (p) => {
        const id = p.id || getUUIDv4();
        p.id = id;
        items.push({
          id,
          modified: p as any,
          status: 'created',
        });
        return p;
      });
    },

    async update(_item: Partial<T>) {
      await base.handleWithHooks('DraftUpdate', _item, 'DraftUpdate', (p) => {
        const id = (p as Partial<T> & { id?: ID }).id;
        if (id !== undefined) {
          const draft = findDraft(id);
          if (draft)
            draft.modified = {
              ...(draft.modified || {}),
              ...(p as Partial<T>),
            } as any;
          else
            items.push({
              id,
              modified: p as any,
              status: 'updated',
            } as IDraftRecord<T>);
        } else {
          // If no id, treat as new draft-created (generate id)
          items.push({
            id: getUUIDv4(),
            modified: p as any,
            status: 'updated',
          } as IDraftRecord<T>);
        }
        return p;
      });
    },

    async delete(_item: Partial<T> | T) {
      await base.handleWithHooks(
        'DraftDelete',
        _item as Partial<T>,
        'DraftDelete',
        (p) => {
          const id = (p as Partial<T> & { id?: ID }).id!;
          const draft = findDraft(id);
          if (draft) draft.status = 'deleted';
          else
            items.push({
              id,
              status: 'deleted',
              original: _item as any,
            } as IDraftRecord<T>);
          return p;
        },
      );
    },

    async commit() {
      await base.handleWithHooks(
        'Commit',
        items,
        'DraftCommit',
        async (p_items) => {
          for (const d of p_items) {
            if (d.status === 'created' && d.modified)
              await base.create(d.modified as any);
            if (d.status === 'updated' && d.modified)
              await base.update(d.modified as any);
            if (d.status === 'deleted' && d.original)
              await base.delete(d.original as any);
          }
          items.length = 0;
          return items;
        },
      );
    },

    async discard(payload) {
      await base.handleWithHooks(
        'Discard',
        payload,
        'DraftDiscard',
        async (item) => {
          if (!item) items.length = 0;
          else {
            items = items.filter((x) => x.id != item.id);
          }
          return items;
        },
      );
    },
  };
}

function normalizeHooks<H>(hooks?: H | H[]): H[] {
  if (!hooks) return [];
  return Array.isArray(hooks) ? hooks : [hooks];
}

export async function runBeforeHandlers<
  T extends Identifiable,
  Action extends string,
  Payload = HookPayload<T, Action>,
>(
  hooks: IDataDraftManagerHook<T> | Array<IDataDraftManagerHook<T>> | undefined,
  key: keyof IDataDraftManagerHook<T>,
  ctx: IHookContext<T, Action>,
): Promise<Payload | false> {
  let modified: Payload | false = ctx.payload as Payload;

  const arr = normalizeHooks<IDataDraftManagerHook<T>>(hooks);
  for (const hookObj of arr) {
    const handler = hookObj[key] as HookBeforeHandler<T, Action> | undefined;

    if (!handler) continue;

    const result = await handler(ctx);

    if (result === false) return false; // cancel
    if (result && typeof result === 'object') {
      modified = { ...modified, ...result } as Payload;
    }
  }

  return modified;
}
export async function runAfterHandlers<
  T extends Identifiable,
  Action extends string,
>(
  hooks: IDataDraftManagerHook<T> | Array<IDataDraftManagerHook<T>> | undefined,
  key: keyof IDataDraftManagerHook<T>,
  ctx: IHookContext<T, Action>,
): Promise<void> {
  const arr = normalizeHooks<IDataDraftManagerHook<T>>(hooks);
  for (const hookObj of arr) {
    const handler = hookObj[key] as HookAfterHandler<T, Action> | undefined;

    if (!handler) continue;
    await handler(ctx);
  }
}
