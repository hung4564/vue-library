import type { IDataset } from '../interfaces/dataset.base';
import { findPartByType } from '../model/visitors/helpers';
import type {
  HighlightClickAction,
  HighlightDataSource,
  HighlightPartOptions,
  HighlightPointerPolicy,
  HighlightPresentation,
  HighlightSelectionOptions,
  HighlightShowOptions,
  HighlightSource,
  HighlightStyle,
} from './types';
import type { IHighlightPart } from './part';

export const DEFAULT_HIGHLIGHT_STYLE: HighlightStyle = {
  mode: 'default',
  color: '#004E98',
  durationMs: 5000,
};

export const DEFAULT_HIGHLIGHT_DATA: HighlightDataSource = { type: 'local' };

export const DEFAULT_HIGHLIGHT_SELECTION: HighlightSelectionOptions = {
  policy: 'single',
  replaceScope: 'source',
};

export const DEFAULT_HIGHLIGHT_PRESENTATION: HighlightPresentation = {
  popup: false,
  clickAction: 'popup',
};

export const DEFAULT_HIGHLIGHT_POINTER: Required<HighlightPointerPolicy> = {
  click: true,
  hover: true,
};

export function findHighlightPart(
  dataset?: IDataset,
): IHighlightPart | undefined {
  return findPartByType(dataset, 'highlight');
}

export function partOptionsToStyle(options: HighlightPartOptions): HighlightStyle {
  const base = options.style ?? {};
  return {
    mode: options.mode ?? base.mode ?? 'default',
    color: options.color ?? base.color,
    durationMs: options.durationMs ?? base.durationMs,
    paint: options.paint ?? base.paint,
    filterCreator: options.filterCreator ?? base.filterCreator,
    stateKey: options.stateKey ?? base.stateKey,
    animate: options.animate ?? base.animate,
    createDefaultState: options.createDefaultState ?? base.createDefaultState,
    layerIds: base.layerIds,
  };
}

export function resolveStyle(args: {
  call?: HighlightStyle;
  part?: IHighlightPart;
  global?: HighlightStyle;
}): HighlightStyle {
  const fromPart = args.part?.getHighlightStyle?.();
  return {
    ...DEFAULT_HIGHLIGHT_STYLE,
    ...args.global,
    ...fromPart,
    ...args.call,
  };
}

export function resolveData(args: {
  call?: HighlightDataSource;
  part?: IHighlightPart;
  global?: HighlightDataSource;
}): HighlightDataSource {
  return (
    args.call ??
    args.part?.getHighlightDataSource?.() ??
    args.global ??
    DEFAULT_HIGHLIGHT_DATA
  );
}

export function resolveSelection(args: {
  call?: HighlightSelectionOptions;
  part?: IHighlightPart;
  global?: HighlightSelectionOptions;
}): HighlightSelectionOptions {
  return {
    ...DEFAULT_HIGHLIGHT_SELECTION,
    ...args.global,
    ...args.part?.getHighlightSelection?.(),
    ...args.call,
  };
}

export function resolvePresentation(args: {
  call?: HighlightPresentation;
  part?: IHighlightPart;
  global?: HighlightPresentation;
}): HighlightPresentation {
  return {
    ...DEFAULT_HIGHLIGHT_PRESENTATION,
    ...args.global,
    ...args.part?.getHighlightPresentation?.(),
    ...args.call,
  };
}

/**
 * Adjust presentation for pointer source:
 * - hover → paint only (no MapLibre popup)
 * - hover → never open MapLibre popup
 * - click (`pointer`) → honor `clickAction` (default popup)
 */
export function resolvePresentationForSource(
  presentation: HighlightPresentation,
  source?: HighlightSource,
): HighlightPresentation {
  const clickAction: HighlightClickAction =
    presentation.clickAction ??
    DEFAULT_HIGHLIGHT_PRESENTATION.clickAction ??
    'popup';

  if (source === 'hover') {
    return { ...presentation, clickAction, popup: false };
  }

  if (source === 'pointer') {
    if (clickAction === 'popup') {
      const popup =
        presentation.popup === false || presentation.popup == null
          ? true
          : presentation.popup;
      return { ...presentation, clickAction, popup };
    }
    // detail | none → suppress MapLibre popup unless kind is explicitly none already
    if (
      presentation.popup === true ||
      (typeof presentation.popup === 'object' &&
        (presentation.popup.kind ?? 'maplibre') !== 'none')
    ) {
      return { ...presentation, clickAction, popup: false };
    }
    return { ...presentation, clickAction };
  }

  return { ...presentation, clickAction };
}

export function resolveShowConfig(
  options: HighlightShowOptions | undefined,
  part: IHighlightPart | undefined,
  globals: {
    style?: HighlightStyle;
    data?: HighlightDataSource;
    selection?: HighlightSelectionOptions;
    presentation?: HighlightPresentation;
  },
) {
  const presentation = resolvePresentationForSource(
    resolvePresentation({
      call: options?.presentation,
      part,
      global: globals.presentation,
    }),
    options?.source,
  );
  return {
    style: resolveStyle({
      call: options?.style,
      part,
      global: globals.style,
    }),
    data: resolveData({
      call: options?.data,
      part,
      global: globals.data,
    }),
    selection: resolveSelection({
      call: options?.selection,
      part,
      global: globals.selection,
    }),
    presentation,
  };
}
