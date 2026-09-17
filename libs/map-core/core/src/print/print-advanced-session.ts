/**
 * Framework-agnostic PrintAdvancedControl orchestration:
 * crosshair / printable area overlays + save / saveAll export.
 */

import type { MapSimple } from '../types';
import { CrosshairManager } from './CrosshairManager';
import { PrintableAreaManager } from './PrintableAreaManager';
import {
  PRINT_PAPER_PRESETS,
  type MapPrintStore,
  type PrintOption,
} from './types';
import { exportMapbox, exportMapboxWithOptions } from './utils';

export const DEFAULT_PRINT_ADVANCED_SETTING: PrintOption = {
  ratio: 1,
  orientation: 'portrait',
  format: 'png',
  paper: 'custom',
  dpi: 96,
  watermark: '',
};

export type PrintAdvancedUiState = {
  show: boolean;
  loading: boolean;
  setting_show: boolean;
  setting: PrintOption;
};

export type PrintAdvancedSessionOptions = {
  callMap: (fn: (map: MapSimple) => void | Promise<void>) => void;
  /** When omit, save/saveAll without a callback are no-ops after export. */
  saveFile?: (dataUrl: string, fileName: string) => void | Promise<void>;
  getDisabledCrosshair?: () => boolean;
  getDisabledPrintableArea?: () => boolean;
  getFileName?: () => string;
  onStateChange?: (state: PrintAdvancedUiState) => void;
  initialSetting?: Partial<PrintOption>;
};

export type PrintAdvancedSession = {
  getState: () => PrintAdvancedUiState;
  show: (options?: PrintOption) => void;
  close: () => void;
  save: (cb?: (image: string) => Promise<void>) => void;
  saveAll: (cb?: (image: string) => Promise<void>) => void;
  toggleSetting: () => void;
  setSettingShow: (show: boolean) => void;
  updateSetting: (next: PrintOption | Partial<PrintOption>) => void;
  applyPaper: (paper: NonNullable<PrintOption['paper']>) => void;
  /** Handlers for {@link createPrintStoreApi} / `initPrint`. */
  getStoreHandlers: () => MapPrintStore;
  destroy: () => void;
};

function cloneSetting(setting: PrintOption): PrintOption {
  return { ...setting };
}

function cloneState(state: PrintAdvancedUiState): PrintAdvancedUiState {
  return {
    show: state.show,
    loading: state.loading,
    setting_show: state.setting_show,
    setting: cloneSetting(state.setting),
  };
}

/**
 * Owns PrintAdvanced overlay + export lifecycle. Hosts keep toolbar/registry/UI.
 */
export function createPrintAdvancedSession(
  options: PrintAdvancedSessionOptions,
): PrintAdvancedSession {
  const state: PrintAdvancedUiState = {
    show: false,
    loading: false,
    setting_show: false,
    setting: {
      ...DEFAULT_PRINT_ADVANCED_SETTING,
      ...options.initialSetting,
    },
  };

  let crosshair: CrosshairManager | undefined;
  let printableArea: PrintableAreaManager | undefined;

  function emit() {
    options.onStateChange?.(cloneState(state));
  }

  function patch(
    partial: Partial<Omit<PrintAdvancedUiState, 'setting'>> & {
      setting?: PrintOption;
    },
  ) {
    if (partial.show !== undefined) state.show = partial.show;
    if (partial.loading !== undefined) state.loading = partial.loading;
    if (partial.setting_show !== undefined) {
      state.setting_show = partial.setting_show;
    }
    if (partial.setting) state.setting = cloneSetting(partial.setting);
    emit();
  }

  function onMapResize() {
    printableArea?.mapResize();
    crosshair?.mapResize();
  }

  function toggleCrosshair(show: boolean) {
    if (options.getDisabledCrosshair?.()) return;
    options.callMap((map) => {
      if (!show) {
        crosshair?.destroy();
        crosshair = undefined;
        return;
      }
      crosshair = new CrosshairManager(map.getCanvas());
      crosshair.create();
    });
  }

  function togglePrintableArea(show: boolean, printOption: PrintOption) {
    if (options.getDisabledPrintableArea?.()) return;
    options.callMap((map) => {
      if (!show) {
        map.off('resize', onMapResize);
        printableArea?.destroy();
        printableArea = undefined;
        return;
      }
      map.on('resize', onMapResize);
      printableArea = new PrintableAreaManager(map.getCanvas(), printOption);
      printableArea.create();
    });
  }

  async function download(dataUrl: string) {
    const fileName = `${options.getFileName?.() ?? 'map'}.png`;
    await options.saveFile?.(dataUrl, fileName);
  }

  function show(printOptions: PrintOption = state.setting) {
    const nextSetting = {
      ...DEFAULT_PRINT_ADVANCED_SETTING,
      ...state.setting,
      ...printOptions,
    };
    patch({ show: true, setting: nextSetting });
    toggleCrosshair(true);
    togglePrintableArea(true, nextSetting);
  }

  function close() {
    patch({ loading: false, show: false });
    toggleCrosshair(false);
    togglePrintableArea(false, state.setting);
  }

  function save(cb?: (image: string) => Promise<void>) {
    options.callMap(async (map) => {
      if (!printableArea) return;
      try {
        patch({ loading: true });
        const setting = state.setting;
        const image = await exportMapboxWithOptions(map, {
          ...printableArea.getCutSize(),
          watermark: setting.watermark || undefined,
          dpi: setting.dpi,
        });
        if (cb) await cb(image);
        else await download(image);
      } finally {
        patch({ loading: false });
      }
    });
  }

  function saveAll(cb?: (image: string) => Promise<void>) {
    options.callMap(async (map) => {
      try {
        patch({ loading: true });
        const setting = state.setting;
        const image = await exportMapbox(map, {
          watermark: setting.watermark || undefined,
          dpi: setting.dpi,
        });
        if (cb) await cb(image);
        else await download(image);
      } finally {
        patch({ loading: false });
      }
    });
  }

  function toggleSetting() {
    patch({ setting_show: !state.setting_show });
  }

  function setSettingShow(showSetting: boolean) {
    patch({ setting_show: showSetting });
  }

  function updateSetting(next: PrintOption | Partial<PrintOption>) {
    const merged =
      'ratio' in next && 'orientation' in next && 'format' in next
        ? (next as PrintOption)
        : { ...state.setting, ...next };
    patch({ setting: merged });
    printableArea?.setOption(merged);
  }

  function applyPaper(paper: NonNullable<PrintOption['paper']>) {
    const next: PrintOption = { ...state.setting, paper };
    if (paper === 'a4' || paper === 'letter') {
      next.ratio = PRINT_PAPER_PRESETS[paper].ratio;
    }
    updateSetting(next);
  }

  function destroy() {
    close();
    state.setting_show = false;
  }

  return {
    getState: () => cloneState(state),
    show,
    close,
    save,
    saveAll,
    toggleSetting,
    setSettingShow,
    updateSetting,
    applyPaper,
    getStoreHandlers: () => ({
      show,
      close,
      save,
      saveAll,
    }),
    destroy,
  };
}
