import { getUUIDv4 } from '@hungpvq/shared';
import type {
  DataHook,
  DataHookAction,
  DataHookBeforeResult,
  DataHookContext,
  DataManager,
  DataRecord,
  DataStore,
  DraftRecord,
  ID,
  PageQuery,
  PageResult,
  RecordId,
} from './types';

function normalizeHooks(hooks?: DataHook | DataHook[]): DataHook[] {
  if (!hooks) return [];
  return Array.isArray(hooks) ? hooks : [hooks];
}

async function runBefore(
  hooks: DataHook[],
  key: keyof DataHook,
  ctx: DataHookContext,
): Promise<{ cancel: boolean; payload: unknown; returnValue?: unknown }> {
  let payload = ctx.payload;
  for (const hook of hooks) {
    const handler = hook[key] as
      | ((c: DataHookContext) => DataHookBeforeResult | Promise<DataHookBeforeResult>)
      | undefined;
    if (!handler) continue;
    const result = await handler({ ...ctx, payload });
    if (result === false) return { cancel: true, payload };
    if (result && typeof result === 'object' && 'cancel' in result && result.cancel) {
      return { cancel: true, payload, returnValue: result.returnValue };
    }
    if (result && typeof result === 'object') {
      payload = { ...(payload as object), ...result };
    }
  }
  return { cancel: false, payload };
}

async function runAfter(
  hooks: DataHook[],
  key: keyof DataHook,
  ctx: DataHookContext,
): Promise<void> {
  for (const hook of hooks) {
    const handler = hook[key] as
      | ((c: DataHookContext) => void | Promise<void>)
      | undefined;
    if (!handler) continue;
    await handler(ctx);
  }
}

function resolveId(input: ID | RecordId | Partial<DataRecord>): ID {
  if (typeof input === 'string' || typeof input === 'number') return input;
  if (input && typeof input === 'object' && input.id != null) return input.id as ID;
  throw new Error('delete requires an id');
}

export function createDataManager<T extends DataRecord = DataRecord>(
  store: DataStore<T>,
  options: { draft?: boolean; hooks?: DataHook | DataHook[] } = {},
): DataManager<T> {
  const hooks = normalizeHooks(options.hooks);
  let drafts: DraftRecord<T>[] = [];

  async function withHooks<R>(
    action: DataHookAction,
    beforeKey: keyof DataHook,
    afterKey: keyof DataHook,
    payload: unknown,
    executor: (payload: unknown) => Promise<R>,
  ): Promise<R | void> {
    const ctx: DataHookContext<T> = { action, payload, store: store as DataStore<T> };
    const before = await runBefore(hooks, beforeKey, ctx);
    if (before.cancel) return before.returnValue as R | void;
    const result = await executor(before.payload);
    await runAfter(hooks, afterKey, { ...ctx, payload: before.payload, result });
    return result;
  }

  const base: DataManager<T> = {
    list(query?: PageQuery): Promise<PageResult<T>> {
      return store.list(query) as Promise<PageResult<T>>;
    },

    async get(id: ID) {
      return withHooks('Get', 'beforeGet', 'afterGet', { id }, async () =>
        store.get(id),
      ) as Promise<T | undefined>;
    },

    async create(patch: Partial<T>) {
      return withHooks('Create', 'beforeCreate', 'afterCreate', patch, (p) =>
        store.create(p as Partial<T>),
      ) as Promise<T | void>;
    },

    async update(patch: Partial<T> & RecordId) {
      return withHooks('Update', 'beforeUpdate', 'afterUpdate', patch, (p) =>
        store.update(p as Partial<T> & RecordId),
      ) as Promise<T | void>;
    },

    async delete(idOrRecord: ID | RecordId | Partial<T>) {
      const id = resolveId(idOrRecord);
      await withHooks('Delete', 'beforeDelete', 'afterDelete', { id }, async () => {
        await store.delete(id);
      });
    },

    async cancel(item?: Partial<T>) {
      await withHooks('Cancel', 'beforeCancel', 'afterCancel', item, async (p) => p);
    },
  };

  if (!options.draft) return base;

  function findDraft(id: ID) {
    return drafts.find((d) => d.id == id);
  }

  return {
    ...base,
    getDraftItems() {
      return drafts;
    },

    async create(patch: Partial<T>) {
      return withHooks(
        'DraftCreate',
        'beforeDraftCreate',
        'afterDraftCreate',
        patch,
        async (p) => {
          const item = { ...(p as Partial<T>) };
          const id = (item.id as ID | undefined) ?? getUUIDv4();
          item.id = id as T['id'];
          drafts.push({
            id,
            modified: item as T,
            status: 'created',
          });
          return item as T;
        },
      );
    },

    async update(patch: Partial<T> & RecordId) {
      return withHooks(
        'DraftUpdate',
        'beforeDraftUpdate',
        'afterDraftUpdate',
        patch,
        async (p) => {
          const item = p as Partial<T> & RecordId;
          const id = item.id;
          const draft = findDraft(id);
          if (draft) {
            draft.modified = { ...(draft.modified ?? {}), ...item } as T;
            if (draft.status !== 'created') draft.status = 'updated';
          } else {
            drafts.push({
              id,
              modified: item as T,
              status: 'updated',
            });
          }
          return item as T;
        },
      );
    },

    async delete(idOrRecord: ID | RecordId | Partial<T>) {
      const id = resolveId(idOrRecord);
      await withHooks(
        'DraftDelete',
        'beforeDraftDelete',
        'afterDraftDelete',
        typeof idOrRecord === 'object' ? idOrRecord : { id },
        async () => {
          const draft = findDraft(id);
          if (draft) {
            if (draft.status === 'created') {
              drafts = drafts.filter((d) => d.id != id);
            } else {
              draft.status = 'deleted';
            }
          } else {
            drafts.push({
              id,
              original: (typeof idOrRecord === 'object'
                ? idOrRecord
                : { id }) as T,
              status: 'deleted',
            });
          }
        },
      );
    },

    async commit() {
      await withHooks(
        'DraftCommit',
        'beforeDraftCommit',
        'afterDraftCommit',
        drafts,
        async (items) => {
          const list = (items as DraftRecord<T>[]) ?? [];
          for (const d of list) {
            if (d.status === 'created' && d.modified) {
              await store.create(d.modified);
            } else if (d.status === 'updated' && d.modified) {
              await store.update(d.modified as T & RecordId);
            } else if (d.status === 'deleted') {
              await store.delete(d.id);
            }
          }
          drafts = [];
          return drafts;
        },
      );
    },

    async discard(id?: ID) {
      await withHooks(
        'DraftDiscard',
        'beforeDraftDiscard',
        'afterDraftDiscard',
        id != null ? drafts.find((d) => d.id == id) : undefined,
        async (payload) => {
          if (!payload) {
            drafts = [];
          } else {
            const item = payload as DraftRecord<T>;
            drafts = drafts.filter((d) => d.id != item.id);
          }
          return drafts;
        },
      );
    },
  };
}
