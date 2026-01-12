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
