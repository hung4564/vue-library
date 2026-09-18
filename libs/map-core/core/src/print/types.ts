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
  /** Optional corner watermark on export. */
  watermark?: string;
  /** Pixel density for advanced export (default 96). */
  dpi?: number;
  /** Named paper preset applied via ratio (A4 ≈ 1.414, Letter ≈ 1.294). */
  paper?: 'custom' | 'a4' | 'letter';
};

export const PRINT_PAPER_PRESETS: Record<
  'a4' | 'letter',
  { ratio: number; label: string }
> = {
  a4: { ratio: 1.414, label: 'A4' },
  letter: { ratio: 1.294, label: 'Letter' },
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
