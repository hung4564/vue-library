import { createWithDataHelper } from '../extra';
import type { IDataset } from '../interfaces';
import { createNamedComponent } from '../model/base';
import { createDatasetLeaf } from '../model/dataset.base.function';
import {
  partOptionsToStyle,
  DEFAULT_HIGHLIGHT_DATA,
  DEFAULT_HIGHLIGHT_PRESENTATION,
  DEFAULT_HIGHLIGHT_SELECTION,
  DEFAULT_HIGHLIGHT_POINTER,
} from './cascade';
import type {
  HighlightDataSource,
  HighlightPartOptions,
  HighlightPointerPolicy,
  HighlightPresentation,
  HighlightSelectionOptions,
  HighlightStyle,
} from './types';

export type IHighlightPart = IDataset & {
  type: 'highlight';
  getHighlightStyle: () => HighlightStyle;
  getHighlightDataSource: () => HighlightDataSource;
  getHighlightSelection: () => HighlightSelectionOptions;
  getHighlightPresentation: () => HighlightPresentation;
  getHighlightPointer: () => Required<HighlightPointerPolicy>;
  getFilterCreator?: () => HighlightStyle['filterCreator'];
  /** @deprecated Prefer getHighlightStyle; kept for paint helpers that read WithDataHelper */
  getData?: () => unknown;
};

/**
 * Attach highlight configuration to a dataset.
 * Paint runs in HighlightController — this part is metadata only.
 */
export function createHighlightPart(
  options: HighlightPartOptions = {},
): IHighlightPart {
  const base = createDatasetLeaf('');
  const style = partOptionsToStyle(options);
  const data = options.data ?? DEFAULT_HIGHLIGHT_DATA;
  const selection = {
    ...DEFAULT_HIGHLIGHT_SELECTION,
    ...options.selection,
  };
  const presentation = {
    ...DEFAULT_HIGHLIGHT_PRESENTATION,
    ...options.presentation,
  };
  const pointer: Required<HighlightPointerPolicy> = {
    ...DEFAULT_HIGHLIGHT_POINTER,
    ...options.pointer,
  };
  const dataHelper = createWithDataHelper(undefined);

  let currentStyle = { ...style };
  let currentData = data;
  let currentSelection = { ...selection };
  let currentPresentation = { ...presentation };
  let currentPointer = { ...pointer };

  return createNamedComponent('HighlightPart', {
    ...base,
    ...dataHelper,
    get type(): 'highlight' {
      return 'highlight';
    },
    getHighlightStyle() {
      return currentStyle;
    },
    getHighlightDataSource() {
      return currentData;
    },
    getHighlightSelection() {
      return currentSelection;
    },
    getHighlightPresentation() {
      return currentPresentation;
    },
    getHighlightPointer() {
      return currentPointer;
    },
    getFilterCreator() {
      return currentStyle.filterCreator;
    },
    setHighlightStyle(partial: Partial<HighlightStyle>) {
      currentStyle = { ...currentStyle, ...partial };
    },
    setHighlightDataSource(next: HighlightDataSource) {
      currentData = next;
    },
    setHighlightSelection(partial: HighlightSelectionOptions) {
      currentSelection = { ...currentSelection, ...partial };
    },
    setHighlightPresentation(partial: HighlightPresentation) {
      currentPresentation = { ...currentPresentation, ...partial };
    },
    setHighlightPointer(partial: HighlightPointerPolicy) {
      currentPointer = { ...currentPointer, ...partial };
    },
  }) as IHighlightPart;
}
