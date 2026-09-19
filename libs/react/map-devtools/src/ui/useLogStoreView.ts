import {
  logMapId,
  resolveMaybePromise,
  rootNamespace,
  type LogDataStore,
  type LogFilterQuery,
  type LogRecord,
} from '@hungpvq/shared-log';
import { useEffect, useState } from 'react';

export type LogStoreView = {
  listed: LogRecord[];
  all: LogRecord[];
  namespaces: string[];
  totalCount: number;
};

const EMPTY_VIEW: LogStoreView = {
  listed: [],
  all: [],
  namespaces: [],
  totalCount: 0,
};

/**
 * Resolve {@link LogDataStore} `list`/`getAll` (sync memory or async IndexedDB).
 * Re-runs when `revision` changes (e.g. mirrored `logs` tick or store notify).
 */
export function useLogStoreView(
  store: LogDataStore,
  query: LogFilterQuery,
  revision: unknown,
): LogStoreView {
  const [view, setView] = useState<LogStoreView>(EMPTY_VIEW);

  useEffect(() => {
    let cancelled = false;
    const mapId = query.mapId ?? 'all';

    void (async () => {
      const [listed, all] = await Promise.all([
        resolveMaybePromise(store.list(query)),
        resolveMaybePromise(store.getAll()),
      ]);
      if (cancelled) return;

      const set = new Set<string>();
      for (const log of all) {
        if (mapId !== 'all' && logMapId(log) !== mapId) continue;
        const key = rootNamespace(log);
        if (key) set.add(key);
      }

      setView({
        listed,
        all,
        namespaces: [...set].sort(),
        totalCount: all.length,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [store, query, revision]);

  return view;
}

/** Load records for one actionId (Flow modal). */
export function useLogStoreActionList(
  store: LogDataStore,
  actionId: string,
  enabled: boolean,
): LogRecord[] {
  const [matched, setMatched] = useState<LogRecord[]>([]);

  useEffect(() => {
    if (!enabled || !actionId) {
      setMatched([]);
      return;
    }
    let cancelled = false;
    void resolveMaybePromise(store.list({ actionId })).then((rows) => {
      if (!cancelled) setMatched(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [store, actionId, enabled]);

  return matched;
}
