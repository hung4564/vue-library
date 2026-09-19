/**
 * Framework-agnostic basemap management (store + mitt + latest-wins apply).
 */

import type { Emitter } from 'mitt';
import type { LoggerFunction } from '../store/interface';
import { BasemapService } from './basemap.service';
import type { BaseMapItem, BaseMapStore, MittTypeBaseMap } from './types';
import { MittTypeBaseMapEventKey } from './types';

/** Attach or reuse {@link BasemapManager} on `store` (`MAP_STORE_KEY.BASEMAP`). */
export function getOrCreateBasemapManager(
  mapId: string,
  store: BaseMapStore,
  emitter: Emitter<MittTypeBaseMap>,
  logger?: LoggerFunction,
): BasemapManager {
  if (store.manager) return store.manager;
  const manager = new BasemapManager(mapId, store, emitter, logger);
  store.manager = manager;
  return manager;
}

export class BasemapManager {
  private pending?: BaseMapItem;
  private flight?: Promise<void>;
  private committed?: BaseMapItem;

  constructor(
    private mapId: string,
    private store: BaseMapStore,
    private emitter: Emitter<MittTypeBaseMap>,
    private logger?: LoggerFunction,
  ) {}

  getBaseMaps(): BaseMapItem[] {
    return this.store.baseMaps;
  }

  getCurrent(): BaseMapItem | undefined {
    return this.store.current;
  }

  getDefaultBaseMapId(): string {
    return this.store.defaultBaseMap;
  }

  isLoading(): boolean {
    return this.store.loading;
  }

  setBaseMaps(baseMaps: BaseMapItem[]): void {
    if (sameBaseMapList(this.store.baseMaps, baseMaps)) return;
    this.logger?.(this.mapId, 'debug', 'setBaseMaps', { baseMaps });
    this.store.baseMaps = baseMaps;
    this.emitter.emit(MittTypeBaseMapEventKey.set, baseMaps);
  }

  setDefaultBaseMap(defaultBaseMap?: string): void {
    const next = defaultBaseMap || '';
    const baseMap = this.store.adapter.getIndexDefault(
      this.store.baseMaps,
      next,
    );

    const sameDefault = this.store.defaultBaseMap === next;
    const shouldApply =
      !!baseMap &&
      (!this.store.current ||
        (!!defaultBaseMap &&
          String(this.store.current.id) !== String(baseMap.id)));

    if (sameDefault && !shouldApply) return;

    this.logger?.(this.mapId, 'debug', 'setDefaultBaseMap', { defaultBaseMap });
    this.store.defaultBaseMap = next;

    if (shouldApply && baseMap) {
      void this.setCurrent(baseMap);
    }
  }

  /**
   * Optimistic UI + single-flight apply; concurrent calls coalesce to latest.
   */
  async setCurrent(baseMap: BaseMapItem): Promise<void> {
    this.logger?.(this.mapId, 'debug', 'setCurrent', { baseMap });

    if (!this.flight) {
      this.committed = this.store.current;
    }

    this.pending = baseMap;
    this.emitCurrent(baseMap);

    if (this.flight) return this.flight;

    this.flight = this.runApplyLoop();
    try {
      await this.flight;
    } finally {
      this.flight = undefined;
    }
  }

  init(baseMaps: BaseMapItem[], defaultBaseMap?: string): void {
    this.logger?.(this.mapId, 'debug', 'init', { baseMaps, defaultBaseMap });
    this.setBaseMaps(baseMaps);
    this.setDefaultBaseMap(defaultBaseMap);
  }

  private emitCurrent(baseMap: BaseMapItem | undefined): void {
    this.store.current = baseMap;
    this.emitter.emit(MittTypeBaseMapEventKey.setCurrent, baseMap);
  }

  private async runApplyLoop(): Promise<void> {
    this.store.loading = true;
    let lastError: unknown;

    while (this.pending) {
      const next = this.pending;
      this.pending = undefined;
      // Optimistic emit already happened in setCurrent; only re-emit on coalesce.
      if (this.store.current?.id !== next.id) {
        this.emitCurrent(next);
      }

      try {
        await BasemapService.switchBasemap(
          this.mapId,
          this.store.adapter,
          next,
        );
        this.committed = next;
        lastError = undefined;
      } catch (error) {
        lastError = error;
        if (!this.pending) {
          this.emitCurrent(this.committed);
        }
      }
    }

    this.store.loading = false;
    if (lastError) throw lastError;
  }
}

function sameBaseMapList(a: BaseMapItem[], b: BaseMapItem[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (String(a[i]?.id) !== String(b[i]?.id)) return false;
  }
  return true;
}
