/**
 * Framework-agnostic print types
 */

/**
 * Print options for generating print images
 */
export interface PrintOptions {
  format?: 'png' | 'pdf';
  dpi?: number;
  title?: string;
  description?: string;
}

/**
 * Print option for store (used in Vue package)
 */
export type PrintOption = {
  ratio: number;
  orientation: 'portrait' | 'landscape';
  format: 'pdf' | 'png' | 'jpg';
};

/**
 * Print store state type
 * Framework-specific stores should use this type for their state
 */
export type MapPrintStore = {
  show?: (props: PrintOption) => void;
  close?: () => void;
  save?: (cb?: (image: string) => Promise<void>) => void;
  saveAll?: (cb?: (image: string) => Promise<void>) => void;
};

export function createDefaultPrintStore(): MapPrintStore {
  return {};
}

export function createPrintStoreApi(store: MapPrintStore) {
  function initPrint({ show, close, save, saveAll }: MapPrintStore) {
    store.show = show;
    store.close = close;
    store.save = save;
    store.saveAll = saveAll;
  }
  function closePrint() {
    store.close?.();
  }
  function showPrint(
    options: PrintOption = {
      ratio: 1,
      orientation: 'portrait',
      format: 'png',
    },
  ) {
    store.show?.(options);
  }
  function savePrint(cb?: (image: string) => Promise<void>) {
    store.save?.(cb);
  }
  function saveAllPrint(cb?: (image: string) => Promise<void>) {
    store.saveAll?.(cb);
  }
  return { showPrint, closePrint, savePrint, saveAllPrint, initPrint };
}
