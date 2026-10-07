import type { Position } from '../types';
import { ensureMapToolbarApi, ensureMapToolbarStore } from './register-domain-store';
import {
  createLiveToolbarStrategy,
  createSubscribable,
  createToolbarModuleApi,
  type LiveToolbarStrategyContext,
} from './toolbar';
import type {
  AnyToolbarOptions,
  AnyToolbarStrategy,
  MapControlButtonState,
  MapControlButtonUIState,
  Toolbar,
  ToolbarOptionsSingle,
} from './types';

export type HostStrategyConfig = {
  getMapId: () => string;
  /** Corner / auto-button author options. */
  getHostOptions: () => AnyToolbarOptions | undefined;
  /** Strip author options (independent of host). */
  getToolbarOptions: () => AnyToolbarOptions | undefined;
  getControlLayout: () =>
    | 'standalone'
    | 'toolbar'
    | 'menu'
    | 'button'
    | undefined;
  getPosition?: () => Position | undefined;
};

/** Host chrome: live UI only — does not write the strip store. */
const noopToolbar: Toolbar = {
  register() {
    /* host-only */
  },
  update() {
    /* host-only */
  },
  unregister() {
    /* host-only */
  },
};

function withPosition(
  toolbar: Toolbar,
  getPosition: (() => Position | undefined) | undefined,
): Toolbar {
  if (!getPosition) return toolbar;
  return {
    register(state: MapControlButtonState) {
      const position = getPosition();
      toolbar.register(position ? { ...state, position } : state);
    },
    update(id, patch) {
      const position = getPosition();
      toolbar.update(id, position ? { ...patch, position } : patch);
    },
    unregister(id) {
      toolbar.unregister(id);
    },
  };
}

function isAuthorToolbarOptions(
  value: unknown,
): value is AnyToolbarOptions {
  if (!value || typeof value !== 'object') return false;
  const opts = value as AnyToolbarOptions;
  if (opts.kind === 'module' || opts.kind === 'module-expandable') return true;
  return typeof (opts as ToolbarOptionsSingle).getState === 'function';
}

function stampSingleId(
  opts: AnyToolbarOptions,
  controlId: string,
): AnyToolbarOptions {
  if ((opts.kind ?? 'single') !== 'single') return opts;
  const single = opts as ToolbarOptionsSingle;
  return {
    ...single,
    kind: 'single',
    id: single.id ?? controlId,
  };
}

function normalizeAuthorButton(
  controlId: string,
  button: AnyToolbarOptions | MapControlButtonUIState | null | undefined,
  onClick?: (e: MouseEvent) => void,
): AnyToolbarOptions | undefined {
  if (!button) return undefined;

  if (isAuthorToolbarOptions(button)) {
    const single = button as ToolbarOptionsSingle;
    if (
      (single.kind ?? 'single') === 'single' &&
      !single.onClick &&
      onClick
    ) {
      return stampSingleId(
        { ...single, kind: 'single', onClick },
        controlId,
      );
    }
    return stampSingleId(button, controlId);
  }

  const snap = button as MapControlButtonUIState;
  return {
    kind: 'single',
    id: controlId,
    getState: () => snap,
    onClick,
  };
}

/** Resolve `host.button` (+ optional `host.onClick`) into author toolbar options. */
export function resolveHostButtonOptions(input: {
  controlId: string;
  hostButton?: AnyToolbarOptions | MapControlButtonUIState | null;
  onClick?: (e: MouseEvent) => void;
}): AnyToolbarOptions | undefined {
  return normalizeAuthorButton(
    input.controlId,
    input.hostButton,
    input.onClick,
  );
}

/** Resolve strip `toolbar` options (no host fallback). */
export function resolveToolbarSpecOptions(input: {
  controlId: string;
  toolbar?: AnyToolbarOptions | null;
}): AnyToolbarOptions | undefined {
  if (!input.toolbar) return undefined;
  return stampSingleId(input.toolbar, input.controlId);
}

function isStripLayout(
  layout: string | undefined,
): layout is 'toolbar' | 'menu' {
  return layout === 'toolbar' || layout === 'menu';
}

/**
 * Adapter binding for `useMapControl`:
 * - `standalone` | `button` → host live strategy (noop store)
 * - `toolbar` | `menu` → strip live strategy (MapToolbarStore)
 *
 * `subscribe` / `onAction` always use the **host** options path (auto / `#btn`).
 */
export function createHostStrategy(
  config: HostStrategyConfig,
): AnyToolbarStrategy {
  const hostSub = createSubscribable<
    MapControlButtonUIState | Record<string, MapControlButtonUIState>
  >();

  let host: AnyToolbarStrategy | undefined;
  let strip: AnyToolbarStrategy | undefined;
  let unsubHost: (() => void) | undefined;
  let unsubExpand: (() => void) | undefined;
  let mountedMapId = '';
  let active: 'host' | 'strip' | 'none' = 'none';

  function expandCtx(): LiveToolbarStrategyContext {
    return {
      getExpandedModuleId: () =>
        mountedMapId
          ? ensureMapToolbarApi(mountedMapId).getExpandedModuleId()
          : null,
      toggleExpandedModule: (moduleId) => {
        if (mountedMapId) {
          ensureMapToolbarApi(mountedMapId).toggleExpandedModule(moduleId);
        }
      },
    };
  }

  function live(
    getOptions: () => AnyToolbarOptions,
    toolbar: Toolbar,
  ): AnyToolbarStrategy {
    return createLiveToolbarStrategy(getOptions, toolbar, expandCtx());
  }

  function clearHost() {
    unsubExpand?.();
    unsubExpand = undefined;
    unsubHost?.();
    unsubHost = undefined;
    host?.unmount();
    host = undefined;
  }

  function clearStrip() {
    strip?.unmount();
    strip = undefined;
  }

  function ensureHost() {
    if (!config.getHostOptions()) {
      clearHost();
      return;
    }
    if (host) return;
    host = live(
      () => config.getHostOptions() as AnyToolbarOptions,
      noopToolbar,
    );
    unsubHost = host.subscribe((state) => hostSub.notify(state));
    if (mountedMapId) {
      unsubExpand = ensureMapToolbarApi(mountedMapId).subscribe(() => {
        host?.sync();
      });
    }
  }

  function ensureStrip() {
    const mapId = mountedMapId;
    if (!mapId || !config.getToolbarOptions()) {
      clearStrip();
      return;
    }
    if (strip) return;
    strip = live(
      () => config.getToolbarOptions() as AnyToolbarOptions,
      withPosition(
        createToolbarModuleApi(
          ensureMapToolbarStore(mapId),
          config.getControlLayout,
        ),
        config.getPosition,
      ),
    );
  }

  function remountForLayout() {
    const mapId = config.getMapId();
    if (mapId !== mountedMapId) {
      clearHost();
      clearStrip();
      mountedMapId = mapId;
      active = 'none';
    }
    if (!mountedMapId) {
      clearHost();
      clearStrip();
      active = 'none';
      return;
    }

    if (isStripLayout(config.getControlLayout())) {
      clearHost();
      ensureStrip();
      strip?.mount();
      active = strip ? 'strip' : 'none';
    } else {
      clearStrip();
      ensureHost();
      host?.mount();
      active = host ? 'host' : 'none';
    }
  }

  return {
    mount: remountForLayout,
    sync() {
      if (active === 'host') host?.sync();
      else if (active === 'strip') strip?.sync();
    },
    unmount() {
      clearHost();
      clearStrip();
      mountedMapId = '';
      active = 'none';
    },
    async onAction(...args: unknown[]) {
      if (!host) ensureHost();
      await host?.onAction(...args);
      if (active === 'host') host?.sync();
    },
    subscribe(fn) {
      return hostSub.subscribe(fn);
    },
  } as AnyToolbarStrategy;
}
